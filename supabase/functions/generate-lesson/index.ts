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

    const body = await req.json();
    const { subject, topic, classGrade } = body;

    if (!subject || !topic) {
      return new Response(JSON.stringify({ error: "Missing subject or topic" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `Create an engaging, interactive lesson on "${topic}" for the subject "${subject}" appropriate for ${classGrade || 'JHS'} students following the Ghana Education Service (GES) curriculum.

The lesson should be:
- Fun and easy to understand for young students
- Include real-world examples relevant to Ghanaian students
- Have clear explanations with step-by-step breakdowns
- Include 2-3 "Did You Know?" fun facts
- End with a brief summary of key points`;

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert GES curriculum teacher creating engaging lessons for students. Return structured lesson content using the provided tool." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        tools: [
          {
            type: "function",
            function: {
              name: "return_lesson",
              description: "Return the generated lesson content",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  introduction: { type: "string", description: "A brief, engaging introduction (2-3 sentences)" },
                  sections: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        heading: { type: "string" },
                        content: { type: "string" },
                        example: { type: "string", description: "A practical example or illustration" },
                      },
                      required: ["heading", "content"],
                      additionalProperties: false,
                    },
                  },
                  funFacts: {
                    type: "array",
                    items: { type: "string" },
                  },
                  summary: { type: "string", description: "Key takeaways in 3-5 bullet points" },
                  estimatedDuration: { type: "string", description: "e.g. 15 minutes" },
                },
                required: ["title", "introduction", "sections", "funFacts", "summary", "estimatedDuration"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_lesson" } },
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
      throw new Error("Failed to generate lesson");
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall || toolCall.function.name !== "return_lesson") {
      throw new Error("AI did not return structured lesson data");
    }

    const lessonData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(lessonData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating lesson:", error);
    return new Response(JSON.stringify({ error: "Failed to generate lesson. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
