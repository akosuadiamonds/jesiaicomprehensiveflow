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
      return new Response(JSON.stringify({ error: "Only teachers can generate exams" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { level, class: className, subject, strands, schoolName, examName, objectiveCount, sectionBCount } = await req.json();

    // Basic input validation
    if (!level || !className || !subject || !Array.isArray(strands) || !schoolName || !examName) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeObjectiveCount = Math.min(Math.max(Number(objectiveCount) || 10, 1), 50);
    const safeSectionBCount = Math.min(Math.max(Number(sectionBCount) || 5, 1), 20);

    const strandsDescription = strands
      .filter((s: any) => s.strand)
      .map((s: any) => `Strand: ${s.strand}, Sub-Strand: ${s.subStrand}${s.indicator ? `, Indicator: ${s.indicator}` : ''}`)
      .join('\n');

    const totalSectionBMarks = safeSectionBCount * 5;

    const prompt = `Generate an end-of-term examination for Ghana Education Service (GES) curriculum.

School: ${schoolName}
Exam: ${examName}
Level: ${level}
Class: ${className}
Subject: ${subject}

Curriculum Coverage:
${strandsDescription}

Requirements:
- Section A: Exactly ${safeObjectiveCount} multiple choice questions with options A, B, C, D.
- Section B: Exactly ${safeSectionBCount} theory questions. Total Section B marks should be approximately ${totalSectionBMarks}.
- Questions should be age-appropriate for ${className} students.
- Cover the specified strands and sub-strands.
- Mix of difficulty levels.`;

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
          { role: "system", content: "You are a GES curriculum exam generator. Use the provided tool to return the exam." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "return_exam",
              description: "Return the generated exam with sections A and B plus marking scheme",
              parameters: {
                type: "object",
                properties: {
                  sectionA: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        number: { type: "number" },
                        question: { type: "string" },
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
                      },
                      required: ["number", "question", "options", "correctAnswer"],
                      additionalProperties: false,
                    },
                  },
                  sectionB: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        number: { type: "number" },
                        question: { type: "string" },
                        marks: { type: "number" },
                        expectedAnswer: { type: "string" },
                      },
                      required: ["number", "question", "marks", "expectedAnswer"],
                      additionalProperties: false,
                    },
                  },
                  totalMarks: { type: "number" },
                },
                required: ["sectionA", "sectionB", "totalMarks"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_exam" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("Failed to generate exam. Please try again.");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "return_exam") {
      throw new Error("AI did not return structured exam data");
    }

    const examData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(examData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating exam:", error);
    return new Response(JSON.stringify({ error: "An error occurred while generating the exam. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
