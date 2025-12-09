export type Submission = {
  id: string;
  rating: number;
  review: string;
  aiResponse: string;
  summary: string;
  actions: string[];
  createdAt: string;
};

export type SubmissionPayload = {
  rating: number;
  review: string;
};
