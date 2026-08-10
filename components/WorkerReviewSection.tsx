"use client";

import React, { useState } from "react";
import { Input, Textarea, Button } from "@nextui-org/react";
import { APP_API } from "@/constants/api";

type ReviewItem = {
  id: number;
  reviewer_name: string;
  rating: number;
  comment?: string | null;
  created_at: string | Date;
};

type Props = {
  workerSlug: string;
  initialReviews: ReviewItem[];
};

export default function WorkerReviewSection({ workerSlug, initialReviews }: Props) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerPhone, setReviewerPhone] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(APP_API.WORKERS.REVIEWS(workerSlug), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerName,
          reviewerPhone: reviewerPhone.trim() ? reviewerPhone : undefined,
          rating,
          comment: comment.trim() ? comment : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message ?? "Failed to submit review. Please try again.");
      }

      setSuccessMsg("Thank you! Your feedback & rating have been submitted successfully.");
      setReviews([json.data, ...reviews]);
      setReviewerName("");
      setReviewerPhone("");
      setComment("");
      setRating(5);
    } catch (err: any) {
      setErrorMsg(err.message ?? "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pt-6 border-t border-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Customer Reviews & Feedback</h3>
        <span className="text-xs text-emerald-400 font-semibold">{reviews.length} Total Feedback</span>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-gray-950/70 border border-gray-800 space-y-5">
        <h4 className="font-bold text-white text-sm">Write a Customer Review</h4>

        {/* Rating Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Your Rating (1 - 5 Stars)</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-transform hover:scale-125 focus:outline-none"
              >
                <span className={(hoverRating || rating) >= star ? "text-yellow-400" : "text-gray-700"}>
                  ★
                </span>
              </button>
            ))}
            <span className="text-xs font-bold text-yellow-400 ml-2">{rating} / 5 Stars</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            isRequired
            type="text"
            label="Your Name / নাম"
            labelPlacement="outside"
            placeholder="e.g. Tanvir Ahmed"
            variant="bordered"
            value={reviewerName}
            onValueChange={setReviewerName}
            classNames={{
              label: "text-gray-300 text-xs font-medium",
              input: "text-white text-sm placeholder:text-gray-600",
              inputWrapper: "border-gray-800 hover:border-emerald-500 bg-gray-900 rounded-xl",
            }}
          />

          <Input
            type="tel"
            label="Phone (Optional for verification)"
            labelPlacement="outside"
            placeholder="e.g. 01700000000"
            variant="bordered"
            value={reviewerPhone}
            onValueChange={setReviewerPhone}
            classNames={{
              label: "text-gray-300 text-xs font-medium",
              input: "text-white text-sm placeholder:text-gray-600",
              inputWrapper: "border-gray-800 hover:border-emerald-500 bg-gray-900 rounded-xl",
            }}
          />
        </div>

        <Textarea
          label="Your Comment / Work Feedback (Optional)"
          labelPlacement="outside"
          placeholder="How was the quality of service, behavior, and pricing?..."
          variant="bordered"
          minRows={2}
          value={comment}
          onValueChange={setComment}
          classNames={{
            label: "text-gray-300 text-xs font-medium",
            input: "text-white text-sm placeholder:text-gray-600",
            inputWrapper: "border-gray-800 hover:border-emerald-500 bg-gray-900 rounded-xl",
          }}
        />

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-xs px-6 rounded-xl transition-all"
        >
          Submit Review
        </Button>
      </form>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-gray-950/40 border border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-sm">{rev.reviewer_name}</h5>
                  <div className="flex items-center gap-1 text-xs text-yellow-400">
                    {"★".repeat(rev.rating)}
                    {"☆".repeat(5 - rev.rating)}
                    <span className="text-gray-400 text-[11px] ml-1">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {rev.comment && (
                <p className="text-xs text-gray-300 leading-relaxed pt-1">
                  "{rev.comment}"
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 text-center py-4">
            No customer reviews yet. Be the first to leave feedback for this worker profile!
          </p>
        )}
      </div>
    </div>
  );
}
