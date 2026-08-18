import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthHero } from "@/components/auth/auth-hero";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/alert";
import { apiConfig } from "@/lib/api/config";
import { DEMO_CREDENTIALS } from "@/lib/api/mock/fixtures";

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
          {apiConfig.useMocks && (
            <Alert tone="info" className="mb-6">
              Modo sin backend activo. Prueba con{" "}
              <strong>{DEMO_CREDENTIALS.email}</strong> /{" "}
              <strong>{DEMO_CREDENTIALS.password}</strong>. Al conectar el API
              real, apaga <code>NEXT_PUBLIC_API_MOCKS</code>.
            </Alert>
          )}

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
