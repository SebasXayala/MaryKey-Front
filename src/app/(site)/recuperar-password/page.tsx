import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center bg-surface px-6 py-16">
      <div className="w-full max-w-md rounded-card bg-white p-8 shadow-card sm:p-10">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
