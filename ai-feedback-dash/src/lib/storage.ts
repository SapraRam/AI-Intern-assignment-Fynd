import { Submission } from "@/types/submission";

// In-memory storage - works on Vercel serverless
// Note: Data resets on cold starts
const submissions: Submission[] = [];

export async function readSubmissions(): Promise<Submission[]> {
  return submissions;
}

export async function saveSubmissions(newSubmissions: Submission[]) {
  submissions.length = 0;
  submissions.push(...newSubmissions);
}

export async function appendSubmission(submission: Submission) {
  submissions.unshift(submission);
  return submission;
}
