import { Submission } from "@/types/submission";

// In-memory storage for Vercel serverless deployment
// Data resets on cold starts - this is expected behavior
// Last updated: 2024-12-09 - Force rebuild v2
const submissions: Submission[] = [];

export async function readSubmissions(): Promise<Submission[]> {
  console.log("[Storage] Reading submissions, count:", submissions.length);
  return [...submissions];
}

export async function saveSubmissions(newSubmissions: Submission[]) {
  console.log("[Storage] Saving submissions, count:", newSubmissions.length);
  submissions.length = 0;
  submissions.push(...newSubmissions);
}

export async function appendSubmission(submission: Submission) {
  console.log("[Storage] Appending submission:", submission.id);
  submissions.unshift(submission);
  return submission;
}
