import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Verify user is a teacher
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("user_role")
      .eq("user_id", userId)
      .single();

    if (profile?.user_role !== "teacher") {
      return new Response(JSON.stringify({ error: "Only teachers can generate quizzes" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { type, title, level, class: className, subject, strands, questionFormats, dokLevel, questionCount, duration } = body;

    // Basic input validation
    if (!title || !level || !className || !subject || !Array.isArray(strands) || !Array.isArray(questionFormats)) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeQuestionCount = Math.min(Math.max(Number(questionCount) || 10, 1), 50);
    const safeDuration = Math.min(Math.max(Number(duration) || 15, 5), 180);
    const safeDokLevel = Math.min(Math.max(Number(dokLevel) || 1, 1), 4);

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

    const allowedFormats = ['mcq', 'true_false', 'short_answer', 'fill_blank'];
    const safeFormats = questionFormats.filter((f: string) => allowedFormats.includes(f));
    const formatsText = safeFormats.map((f: string) => formatDescriptions[f] || f).join(', ');

    const prompt = `Generate a ${type || 'quiz'} for Ghana Education Service (GES) curriculum.

Title: ${title}
Level: ${level}
Class: ${className}
Subject: ${subject}
Duration: ${safeDuration} minutes

Curriculum Coverage:
${strandsDescription}

Requirements:
- Exactly ${safeQuestionCount} questions total.
- Question formats to use: ${formatsText}. Mix the formats proportionally across the ${safeQuestionCount} questions.
- Difficulty level: ${dokDescriptions[safeDokLevel]}
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
      throw new Error("Failed to generate quiz. Please try again.");
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
    return new Response(JSON.stringify({ error: "An error occurred while generating the quiz. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
