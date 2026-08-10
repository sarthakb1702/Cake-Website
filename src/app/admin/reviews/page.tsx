"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReviewsStore, ReviewItem } from "@/lib/reviews-store";
import { ArrowLeft, Star, Plus, Trash2, CheckCircle2, AlertCircle, Edit3 } from "lucide-react";

export default function AdminReviewsPage() {
  const router = useRouter();
  const { reviews, addReview, updateReview, deleteReview } = useReviewsStore();

  const [newAuthor, setNewAuthor] = useState("");
  const [newQuote, setNewQuote] = useState("");
  const [newRating, setNewRating] = useState(5);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [editRating, setEditRating] = useState(5);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor || !newQuote) return;

    addReview({
      name: newAuthor,
      quote: newQuote,
      rating: Number(newRating),
      approved: true,
    });

    setNewAuthor("");
    setNewQuote("");
    setSuccessMsg("New review added & published!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleStartEdit = (r: ReviewItem) => {
    setEditingId(r.id);
    setEditAuthor(r.name);
    setEditQuote(r.quote);
    setEditRating(r.rating);
  };

  const handleSaveEdit = (id: string) => {
    updateReview(id, {
      name: editAuthor,
      quote: editQuote,
      rating: Number(editRating),
    });
    setEditingId(null);
    setSuccessMsg("Review updated!");
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-cream px-5 py-10 md:px-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-bold text-chocolate border border-border hover:bg-blush transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Panel
          </Link>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Content Management • Customer Reviews
          </span>
        </div>

        <div className="bg-card p-6 md:p-10 rounded-[2.5rem] border border-border shadow-lift space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-butter/40 px-3.5 py-1 text-xs font-bold text-chocolate border border-butter">
              <Star className="h-3.5 w-3.5 text-[#E86A7A] fill-current" />
              Manage Testimonials
            </span>
            <h1 className="mt-3 font-display text-3xl md:text-4xl font-black text-chocolate uppercase">
              Customer Reviews Manager
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Approve, edit, feature, or delete customer testimonials displayed on the homepage.
            </p>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl bg-pistachio/50 p-4 text-xs font-bold text-chocolate border border-pistachio">
              <CheckCircle2 className="h-5 w-5 text-chocolate shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Add New Review Form */}
          <form onSubmit={handleAddReview} className="bg-cream p-6 rounded-3xl border border-border space-y-4">
            <h3 className="font-display text-lg font-bold text-chocolate uppercase flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#E86A7A]" /> Add New Customer Review
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold text-chocolate uppercase">Reviewer Name</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full text-xs font-bold border border-border rounded-xl p-2.5 bg-card text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-chocolate uppercase">Rating (1 to 5 Stars)</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(Number(e.target.value))}
                  className="w-full text-xs font-bold border border-border rounded-xl p-2.5 bg-card text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★☆</option>
                  <option value={3}>3 Stars ★★★☆☆</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-chocolate uppercase">Review Quote Text</label>
              <textarea
                rows={2}
                required
                value={newQuote}
                onChange={(e) => setNewQuote(e.target.value)}
                placeholder="The Belgian chocolate cake was light, delicious, and 100% eggless..."
                className="w-full text-xs border border-border rounded-xl p-3 bg-card text-chocolate outline-none focus:ring-2 focus:ring-[#E86A7A]"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#E86A7A] hover:bg-[#d65767] transition-all shadow-badge cursor-pointer"
            >
              + Add & Publish Review
            </button>
          </form>

          {/* List of Existing Reviews */}
          <div className="space-y-4">
            <h3 className="font-display text-xl font-black text-chocolate uppercase">
              Current Reviews ({reviews.length})
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-3xl border border-border bg-cream flex flex-col justify-between space-y-4"
                >
                  {editingId === r.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full text-xs font-bold border border-border rounded-xl p-2 bg-card text-chocolate"
                      />
                      <textarea
                        rows={3}
                        value={editQuote}
                        onChange={(e) => setEditQuote(e.target.value)}
                        className="w-full text-xs border border-border rounded-xl p-2 bg-card text-chocolate"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSaveEdit(r.id)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#E86A7A]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 rounded-full text-xs font-bold text-chocolate bg-card border border-border"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1 text-[#E86A7A]">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="h-3.5 w-3.5 fill-current" />
                            ))}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.approved ? "bg-pistachio text-chocolate" : "bg-butter text-chocolate"
                            }`}
                          >
                            {r.approved ? "Approved & Live" : "Pending"}
                          </span>
                        </div>

                        <blockquote className="mt-3 text-xs italic font-medium text-chocolate">
                          “{r.quote}”
                        </blockquote>
                        <p className="mt-2 text-xs font-bold text-chocolate">— {r.name}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <button
                          onClick={() =>
                            updateReview(r.id, { approved: !r.approved })
                          }
                          className="px-3 py-1 rounded-full text-[11px] font-bold text-chocolate bg-card border border-border hover:bg-blush"
                        >
                          {r.approved ? "Hide" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleStartEdit(r)}
                          className="px-3 py-1 rounded-full text-[11px] font-bold text-white bg-[#E86A7A] hover:bg-[#d65767]"
                        >
                          <Edit3 className="h-3 w-3 inline mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete review from ${r.name}?`)) deleteReview(r.id);
                          }}
                          className="p-1.5 rounded-full text-rose hover:bg-blush"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
