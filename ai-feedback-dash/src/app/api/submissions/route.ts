import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { appendSubmission, readSubmissions } from "@/lib/storage";
import { generateSubmissionInsights } from "@/lib/ai";
import { Submission } from "@/types/submission";

export async function GET() {
  const submissions = await readSubmissions();
  return NextResponse.json(submissions, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rating = Number(body?.rating);
    const review = typeof body?.review === "string" ? body.review.trim() : "";

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Rating must be between 1 and 5." }, {
        status: 400,
      });
    }

    if (review.length < 10) {
      return NextResponse.json(
        { message: "Review must be at least 10 characters long." },
        { status: 400 },
      );
    }

    const insights = await generateSubmissionInsights(rating, review);

    const submission: Submission = {
      id: randomUUID(),
      rating,
      review,
      aiResponse: insights.aiResponse,
      summary: insights.summary,
      actions: insights.actions,
      createdAt: new Date().toISOString(),
    };

    await appendSubmission(submission);

    return NextResponse.json(submission, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Failed to store submission", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
