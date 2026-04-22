import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Inloggen | Merkly",
  description: "Log in bij Merkly om je huisstijlen te beheren en premium te activeren.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
