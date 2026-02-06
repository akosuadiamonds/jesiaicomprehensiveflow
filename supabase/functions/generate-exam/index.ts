import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const LOVABLE_API_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { level, class: className, subject, strands, schoolName, examName, objectiveCount, sectionBCount } = await req.json();

    const strandsDescription = strands
      .filter((s: any) => s.strand)
      .map((s: any) => `Strand: ${s.strand}, Sub-Strand: ${s.subStrand}${s.indicator ? `, Indicator: ${s.indicator}` : ''}`)
      .join('\n');

    const prompt = `You are a Ghana Education Service (GES) curriculum expert. Generate an end-of-term examination for the following:

School: ${schoolName}
Exam: ${examName}
Level: ${level}
Class: ${className}
Subject: ${subject}

Curriculum Coverage:
${strandsDescription}

Requirements:
- Section A: Generate exactly ${objectiveCount} multiple choice questions (MCQ) with options A, B, C, D. Each question should have exactly one correct answer.
- Section B: Generate exactly ${sectionBCount} theory/essay questions with marks allocated and expected answers for the marking scheme.
- Questions should be age-appropriate for ${className} students.
- Questions should cover the strands and sub-strands specified.
- Include a mix of difficulty levels (easy, medium, hard).
- Section A is worth 1 mark per question. Section B marks should total approximately ${sectionBCount * 5} marks.

Respond in this exact JSON format:
{
  "sectionA": [
    {
      "number": 1,
      "question": "question text",
      "options": [
        {"label": "A", "text": "option text"},
        {"label": "B", "text": "option text"},
        {"label": "C", "text": "option text"},
        {"label": "D", "text": "option text"}
      ],
      "correctAnswer": "A"
    }
  ],
  "sectionB": [
    {
      "number": 1,
      "question": "question text",
      "marks": 5,
      "expectedAnswer": "detailed expected answer for marking scheme"
    }
  ],
  "totalMarks": ${objectiveCount + sectionBCount * 5}
}

IMPORTANT: Return ONLY valid JSON, no markdown, no explanation.`;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch(LOVABLE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an exam generator. Always respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errorText}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown code fences if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const examData = JSON.parse(content);

    return new Response(JSON.stringify(examData), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Error generating exam:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
