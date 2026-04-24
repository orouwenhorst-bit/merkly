"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Triggert automatisch logo-generatie als de guide nog geen logo heeft.
 * Rendert niets — puur side-effect component.
 */
export default function AutoLogoFetcher({
  guideId,
  hasLogo,
}: {
  guideId: string;
  hasLogo: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (hasLogo) return;

    fetch(`/api/guides/${guideId}/init-logo`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.logoImageUrl) {
          router.refresh(); // Herlaad server component met nieuw logo
        }
      })
      .catch((err) => console.error("Auto logo init mislukt:", err));
  }, [guideId, hasLogo, router]);

  return null;
}
