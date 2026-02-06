import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, title, level, class: className, subject, strands, questionFormats, dokLevel, questionCount, duration } = body;

    const strandsDescription = strands
      .filter((s: any) => s.strand)
      .map((s: any) => `Strand: ${s.strand}${s.subStrand ? `, Sub-Strand: ${s.subStrand}` : ''}`)
      .join('\n');

    const formatDescriptions: Record<string, string> = {
      mcq: 'multiple choice with options A, B, C, D',
      true_false: 'true or false',
      short_answer: 'short answer (1-2 sentences)',
      fill_blank: 'fill in the blank',
    };

    const dokDescriptions: Record<number, string> = {
      1: 'DOK 1 (Recall): factual recall, definitions, simple procedures',
      2: 'DOK 2 (Skill/Concept): comparisons, classifications, cause and effect',
      3: 'DOK 3 (Strategic Thinking): reasoning, justification, drawing conclusions',
      4: 'DOK 4 (Extended Thinking): research, synthesis, complex analysis',
    };

    const formatsText = questionFormats.map((f: string) => formatDescriptions[f] || f).join(', ');

    const prompt = `Generate a ${type} for Ghana Education Service (GES) curriculum.

Title: ${title}
Level: ${level}
Class: ${className}
Subject: ${subject}
Duration: ${duration} minutes

Curriculum Coverage:
${strandsDescription}

Requirements:
- Exactly ${questionCount} questions total.
- Question formats to use: ${formatsText}. Mix the formats proportionally across the ${questionCount} questions.
- Difficulty level: ${dokDescriptions[dokLevel]}
- Questions should be age-appropriate for ${className} students.
- Cover the specified strands and sub-strands.
- For MCQ questions, provide 4 options (A, B, C, D).
- For true/false questions, the correct answer should be "True" or "False".
- For short answer and fill-in-the-blank, provide expected answers.
- Each question is worth 1 mark for MCQ/true-false and 2 marks for short answer/fill-blank.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a GES curriculum quiz/test generator. Use the provided tool to return the quiz/test." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "return_quiz",
              description: "Return the generated quiz/test questions with answers",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        number: { type: "number" },
                        question: { type: "string" },
                        format: { type: "string", enum: ["mcq", "true_false", "short_answer", "fill_blank"] },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              label: { type: "string" },
                              text: { type: "string" },
                            },
                            required: ["label", "text"],
                            additionalProperties: false,
                          },
                        },
                        correctAnswer: { type: "string" },
                        dokLevel: { type: "number" },
                      },
                      required: ["number", "question", "format", "correctAnswer", "dokLevel"],
                      additionalProperties: false,
                    },
                  },
                  totalMarks: { type: "number" },
                },
                required: ["questions", "totalMarks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_quiz" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "return_quiz") {
      throw new Error("AI did not return structured quiz data");
    }

    const quizData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
