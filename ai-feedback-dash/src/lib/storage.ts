import { Submission } from "@/types/submission";
import { getCollection } from './mongodb';

const SUBMISSIONS_COLLECTION = 'submissions';

export async function readSubmissions(): Promise<Submission[]> {
  try {
    const collection = await getCollection<Submission>(SUBMISSIONS_COLLECTION);
    const submissions = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`[MongoDB] Fetched ${submissions.length} submissions`);
    return submissions;
  } catch (error) {
    console.error('[MongoDB] Error reading submissions:', error);
    return [];
  }
}

export async function saveSubmissions(newSubmissions: Submission[]) {
  try {
    const collection = await getCollection<Submission>(SUBMISSIONS_COLLECTION);
    // Clear existing submissions
    await collection.deleteMany({});
    
    if (newSubmissions.length > 0) {
      await collection.insertMany(newSubmissions);
    }
    
    console.log(`[MongoDB] Saved ${newSubmissions.length} submissions`);
  } catch (error) {
    console.error('[MongoDB] Error saving submissions:', error);
    throw error;
  }
}

export async function appendSubmission(submission: Submission) {
  try {
    const collection = await getCollection<Submission>(SUBMISSIONS_COLLECTION);
    const result = await collection.insertOne(submission);
    console.log(`[MongoDB] Inserted submission with id: ${result.insertedId}`);
    return submission;
  } catch (error) {
    console.error('[MongoDB] Error appending submission:', error);
    throw error;
  }
}
