"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Client component that triggers premium generation after payment.
 * Shows a loading state, then refreshes the page when done.
 */
export default function PremiumGenerator({ guideId }: { guideId: string }) {
  const [status, setStatus] = useState<"generating" | "done" | "error">("generating");
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      try {
        const res = await fetch("/api/generate-premium", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guideId }),
        });
        if (!res.ok) throw new Error("Generation failed");
        const data = await res.json();
        if (!cancelled) {
          setStatus("done");
          // Remove ?paid=1 and refresh to show full content
          router.replace(`/result/${guideId}`);
          router.refresh();
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    generate();
    return () => { cancelled = true; };
  }, [guideId, router]);

  if (status === "done") return null;
  if (status === "error") return null; // Silently fail — webhook may still handle it

  return (
    <div className="mb-8 rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 flex items-center gap-4 animate-pulse">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
      <div>
        <p className="font-bold text-sm">Premium huisstijl wordt gegenereerd...</p>
        <p className="text-white/60 text-xs mt-0.5">Dit duurt meestal 15-30 seconden. De pagina ververst automatisch.</p>
      </div>
    </div>
  );
}
