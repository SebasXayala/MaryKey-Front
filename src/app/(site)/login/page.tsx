import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHero } from "@/components/auth/auth-hero";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede a tu cuenta Mary Kay.",
};

export default function LoginPage() {
  return (
    <div className="grid min-h-[calc(100dvh-5rem)] lg:grid-cols-2">
      <AuthHero />

      <div className="flex items-center justify-center px-6 py-14 sm:px-12">
        <div className="w-full max-w-md">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
