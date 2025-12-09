import { promises as fs } from "node:fs";
import path from "node:path";
import { Submission } from "@/types/submission";

const DATA_PATH = path.join(process.cwd(), "data", "submissions.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify([]), "utf8");
  }
}

export async function readSubmissions(): Promise<Submission[]> {
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
  await ensureDataFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(submissions, null, 2), "utf8");
}

export async function appendSubmission(submission: Submission) {
  const submissions = await readSubmissions();
  submissions.unshift(submission);
  await saveSubmissions(submissions);
  return submission;
}
