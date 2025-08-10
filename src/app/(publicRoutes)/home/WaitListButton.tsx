"use client";

import { PartyPopper } from "lucide-react";
import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { useClerk } from "@clerk/nextjs";

/**
 * Custom waitlist form that preserves UI while delegating functionality to Clerk Waitlist.
 * Requires `waitlistUrl` configured on `ClerkProvider` and Waitlist route available.
 */
const WaitlistForm = () => {
  const { openWaitlist } = useClerk(); // Get the openWaitlist method
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(false);
      setIsSubmitting(true);
      try {
        // Open Clerk Waitlist overlay
        await openWaitlist(); // Open the overlay without passing email
        setSuccess(true); // Set success state if the overlay opens
      } catch (err) {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [openWaitlist]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center text-center">
     
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[#E8083E] flex items-center gap-2 text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Joining..." : "Join WaitList "} <PartyPopper className="w-4 h-4" />
        </button>
   
     
    </form>
  );
};

export { WaitlistForm };