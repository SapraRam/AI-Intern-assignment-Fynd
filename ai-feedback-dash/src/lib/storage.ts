import { promises as fs } from "node:fs";
import path from "node:path";
import { Submission } from "@/types/submission";

const DATA_PATH = path.join(process.cwd(), "data", "submissions.json");

// In-memory storage for serverless environments (Vercel)
// Note: Data resets on cold starts - use a database for persistence
let inMemorySubmissions: Submission[] | null = null;

// Check if running in serverless environment
const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME;

async function ensureDataFile() {
  if (isServerless) return;
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify([]), "utf8");
  }
}

async function loadInitialData(): Promise<Submission[]> {
  if (inMemorySubmissions !== null) return inMemorySubmissions;
  
  try {
    // Try to read from file (works in development)
    await fs.access(DATA_PATH);
    const file = await fs.readFile(DATA_PATH, "utf8");
    const parsed = JSON.parse(file) as Submission[];
    inMemorySubmissions = Array.isArray(parsed) ? parsed : [];
  } catch {
    // File doesn't exist or can't be read - start with empty array
    inMemorySubmissions = [];
  }
  
  return inMemorySubmissions;
}

export async function readSubmissions(): Promise<Submission[]> {
  if (isServerless) {
    return await loadInitialData();
  }
  
  await ensureDataFile();
  const file = await fs.readFile(DATA_PATH, "utf8");
  try {
    const parsed = JSON.parse(file) as Submission[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse submissions file", error);
    return [];
  }
}

export async function saveSubmissions(submissions: Submission[]) {
  if (isServerless) {
    inMemorySubmissions = submissions;
    return;
  }
  
  await ensureDataFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(submissions, null, 2), "utf8");
}

export async function appendSubmission(submission: Submission) {
  const submissions = await readSubmissions();
  submissions.unshift(submission);
  await saveSubmissions(submissions);
  return submission;
}
