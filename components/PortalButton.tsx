"use client";

import { useState } from "react";

export default function PortalButton({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Portaal ophalen mislukt. Probeer het opnieuw.");
        setLoading(false);
      }
    } catch {
      alert("Er ging iets mis. Probeer het opnieuw.");
      setLoading(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Laden..." : children}
    </button>
  );
}
