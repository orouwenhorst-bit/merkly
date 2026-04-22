import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Account aanmaken | Merkly",
  description: "Maak gratis een Merkly-account en start direct met het genereren van je huisstijl.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
