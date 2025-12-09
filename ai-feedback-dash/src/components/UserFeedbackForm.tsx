"use client";

import { useMemo, useState } from "react";
import { Submission } from "@/types/submission";

const STAR_VALUES = [1, 2, 3, 4, 5] as const;
const STAR_LABELS = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

type FormState = {
  rating: number;
  review: string;
};

const INITIAL_STATE: FormState = {
  rating: 0,
  review: "",
};

export function UserFeedbackForm() {
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSubmission, setLastSubmission] = useState<Submission | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const isDisabled = useMemo(
    () => pending || formState.review.trim().length < 10 || formState.rating === 0,
    [pending, formState.review, formState.rating],
  );

  const charCount = formState.review.length;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody?.message ?? "Unable to submit feedback");
      }

      const submission = (await response.json()) as Submission;
      setLastSubmission(submission);
      setFormState(INITIAL_STATE);
    } catch (cause) {
      console.error(cause);
      setError(cause instanceof Error ? cause.message : "Unexpected error");
    } finally {
      setPending(false);
    }
  }

  function resetForm() {
    setLastSubmission(null);
    setFormState(INITIAL_STATE);
    setError(null);
  }

  const displayRating = hoveredStar ?? formState.rating;
  const ratingLabel = displayRating > 0 ? STAR_LABELS[displayRating - 1] : "Select a rating";

  return (
    <div className="w-full">
      {!lastSubmission ? (
        <div className="animate-fade-in">
          {/* Icon & Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-linear-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg glow-primary">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">How was your experience?</h2>
            <p className="text-[var(--text-secondary)] text-sm">We'd love to hear your thoughts</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="text-center">
              <div className="inline-flex gap-2 p-3 rounded-2xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] border border-[var(--border)] shadow-inner">
                {STAR_VALUES.map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setFormState((prev) => ({ ...prev, rating: value }))}
                    onMouseEnter={() => setHoveredStar(value)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="p-1.5 rounded-xl transition-all duration-300 hover:scale-110 focus:outline-none group"
                    aria-label={`${value} star`}
                  >
                    {displayRating >= value ? (
                      <svg 
                        className="w-9 h-9 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] transition-all duration-300 scale-110"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ) : (
                      <svg 
                        className="w-9 h-9 text-amber-400/40 group-hover:text-amber-400/70 group-hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.3)] transition-all duration-300"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <p className={`mt-3 text-sm font-medium transition-all duration-300 ${displayRating > 0 ? 'text-amber-400' : 'text-[var(--text-muted)]'}`}>{ratingLabel}</p>
            </div>

            {/* Review Input */}
            <div className="space-y-2">
              <textarea
                required
                minLength={10}
                rows={4}
                value={formState.review}
                onChange={(e) => setFormState((prev) => ({ ...prev, review: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none transition-all focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-glow)]"
                placeholder="Share your thoughts with us..."
              />
              <div className="flex items-center justify-between px-1">
                <span className={`text-xs font-medium flex items-center gap-1.5 ${charCount >= 10 ? 'text-[var(--success)]' : 'text-[var(--text-muted)]'}`}>
                  {charCount >= 10 ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Ready
                    </>
                  ) : (
                    `${10 - charCount} more characters`
                  )}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{charCount}</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[var(--error-glow)] border border-[var(--error)]/30 rounded-xl text-sm text-[var(--error)]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isDisabled}
              className="w-full py-3.5 px-6 rounded-2xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:shadow-lg hover:shadow-[var(--primary)]/25 hover:-translate-y-0.5 disabled:hover:transform-none disabled:hover:shadow-none"
            >
              {pending ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Submit Feedback
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* Success State */
        <div className="animate-scale-in text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--success-glow)] border-2 border-[var(--success)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Thank you!</h3>
          <p className="text-[var(--text-secondary)] mb-6">Your feedback has been submitted</p>

          {/* AI Response */}
          <div className="text-left bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--secondary)] to-[var(--accent)] flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--secondary-light)]">AI Response</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{lastSubmission.aiResponse}</p>
          </div>

          <button onClick={resetForm} className="btn btn-secondary w-full">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Submit Another
          </button>
        </div>
      )}
    </div>
  );
}
