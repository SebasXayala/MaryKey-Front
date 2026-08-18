"use client";

import { apiConfig } from "@/lib/api/config";
import { authService } from "@/services/auth.service";
import type { SocialProvider } from "@/types/auth";

const providers: { id: SocialProvider; label: string; icon: React.ReactNode }[] =
  [
    {
      id: "google",
      label: "Google",
      icon: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z"
          />
        </svg>
      ),
    },
    {
      id: "apple",
      label: "Apple",
      icon: (
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden fill="currentColor">
          <path d="M16.7 12.7c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.8-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.3 2.6 1.3-.1 1.8-.9 3.4-.9s2 .9 3.4.8c1.4 0 2.3-1.2 3.2-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.9-1.1-2.9-4ZM14.2 4.6c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3.1 1.6-.7.8-1.3 2-1.1 3.2 1.1.1 2.3-.6 3.1-1.5Z" />
        </svg>
      ),
    },
  ];

/**
 * Login social. La URL de OAuth la define el backend; aquí solo se
 * redirige. Mientras no exista, los botones quedan deshabilitados en
 * lugar de fingir que funcionan.
 */
export function SocialAuthButtons({ redirectTo = "/cuenta" }: { redirectTo?: string }) {
  const disabled = apiConfig.useMocks || !apiConfig.baseUrl;

  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          disabled={disabled}
          title={
            disabled
              ? "Disponible cuando el backend exponga el flujo OAuth."
              : undefined
          }
          onClick={() => {
            window.location.href = authService.socialAuthUrl(
              provider.id,
              redirectTo,
            );
          }}
          className="flex h-12 items-center justify-center gap-2.5 rounded-field border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {provider.icon}
          {provider.label}
        </button>
      ))}
    </div>
  );
}
