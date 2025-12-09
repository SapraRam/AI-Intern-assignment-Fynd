import OpenAI from "openai";

const client = process.env.OPENAI_API_KEY
? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
: null;

type InsightResult = {
  aiResponse: string;
  summary: string;
  actions: string[];
};

const FALLBACK_ACTIONS = [
  "Thank the user for their detailed feedback",
  "Share the insights with the product team",
  "Reach out with a personalised follow-up if contact info is available",
];

function fallbackInsights(rating: number, review: string): InsightResult {
  const tone = rating >= 4 ? "glowing" : rating >= 3 ? "balanced" : "critical";
  const sentiment = rating >= 4 ? "positive" : rating >= 3 ? "mixed" : "negative";

  return {
    aiResponse: `Thanks for leaving a ${rating}-star review! We appreciate your ${tone} notes and your input will reach the right team immediately.`,
    summary: `A ${sentiment} customer experience where the main message was: "${review.slice(0, 120)}${
      review.length > 120 ? "…" : ""
    }"`,
    actions: FALLBACK_ACTIONS,
  };
}

export async function generateSubmissionInsights(
  rating: number,
  review: string,
): Promise<InsightResult> {
  if (!client) {
    return fallbackInsights(rating, review);
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are an empathetic customer-success analyst. Only return minified JSON with keys aiResponse, summary, actions (array).",
        },
        {
          role: "user",
          content: JSON.stringify({ rating, review }),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ai_feedback_response",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["aiResponse", "summary", "actions"],
            properties: {
              aiResponse: { type: "string" },
              summary: { type: "string" },
              actions: {
                type: "array",
                minItems: 1,
                maxItems: 4,
                items: { type: "string" },
              },
            },
          },
        },
      },
    });

    const content = completion.choices?.[0]?.message?.content;
    let raw: string | undefined;

    if (typeof content === "string") {
      raw = content;
    } else if (Array.isArray(content)) {
      const typedContent = content as Array<{ type?: string; text?: string }>;
      const textPart = typedContent.find(
        (part): part is { type: "text"; text: string } =>
          typeof part === "object" && part !== null && part.type === "text" &&
          typeof part.text === "string",
      );
      raw = textPart?.text;
    }

    if (!raw) {
      throw new Error("Missing AI response content");
    }

    const parsed = JSON.parse(raw) as InsightResult;
    return parsed;
  } catch (error) {
    console.error("AI generation failed", error);
    return fallbackInsights(rating, review);
  }
}
