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

    const body = await req.json();
    const { subject, topic, practiceType, difficulty, questionCount } = body;

    if (!subject || !topic) {
      return new Response(JSON.stringify({ error: "Missing subject or topic" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const safeCount = Math.min(Math.max(Number(questionCount) || 10, 5), 50);
    const safeDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

    const typeDescriptions: Record<string, string> = {
      quick: `Generate ${safeCount} quick practice questions. Mix of MCQ and True/False.`,
      mock: `Generate ${safeCount} mock test questions. Mix of MCQ, True/False, and short answer.`,
      exam: `Generate ${safeCount} timed exam-style questions similar to BECE/WASSCE format. Include MCQ and structured questions.`,
    };

    const prompt = `Generate practice questions for a student studying "${topic}" in "${subject}" (Ghana Education Service curriculum).

${typeDescriptions[practiceType] || typeDescriptions.quick}

Difficulty: ${safeDifficulty}
- Easy: basic recall and definitions
- Medium: application and comprehension
- Hard: analysis, evaluation, and problem-solving

Each question should be clear and age-appropriate for JHS/SHS students.`;

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a GES curriculum practice question generator. Return structured questions using the provided tool." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "return_practice",
              description: "Return the generated practice questions",
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
                        format: { type: "string", enum: ["mcq", "true_false", "short_answer"] },
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
                        explanation: { type: "string", description: "Brief explanation of the correct answer" },
                      },
                      required: ["number", "question", "format", "correctAnswer", "explanation"],
                      additionalProperties: false,
                    },
                  },
                  totalQuestions: { type: "number" },
                  estimatedTime: { type: "string" },
                },
                required: ["questions", "totalQuestions", "estimatedTime"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_practice" } },
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
      throw new Error("Failed to generate practice questions");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "return_practice") {
      throw new Error("AI did not return structured practice data");
    }

    const practiceData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(practiceData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating practice:", error);
    return new Response(JSON.stringify({ error: "Failed to generate practice questions. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
