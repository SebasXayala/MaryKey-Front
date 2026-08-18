import type { Metadata } from "next";

import { AuthHero } from "@/components/auth/auth-hero";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta Mary Kay.",
};

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100dvh-5rem)] lg:grid-cols-2">
      <AuthHero title="Tu belleza, tu poder." />
      <div className="flex items-center justify-center px-6 py-14 sm:px-12">
        <RegisterForm />
      </div>
    </div>
  );
}
