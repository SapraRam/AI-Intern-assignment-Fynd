import Link from "next/link";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard · AI Feedback",
  description: "Analytics and feedback management dashboard",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-default)] flex flex-col">
      {/* Navigation */}
      <nav className="flex-shrink-0 glass border-b border-[var(--border)] sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg">
                <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-[var(--text-primary)]">AI Feedback</span>
                <span className="text-xs text-[var(--text-muted)] block -mt-0.5">Dashboard</span>
              </div>
            </Link>
            
            <Link 
              href="/" 
              className="btn btn-secondary text-sm py-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline">Back to Form</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <AdminDashboard />
        </div>
      </main>
    </div>
  );
}
