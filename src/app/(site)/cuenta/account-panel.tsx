"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { initials } from "@/lib/utils/format";

const roleLabels: Record<string, string> = {
  customer: "Clienta",
  consultant: "Consultora de belleza",
  admin: "Administradora",
};

export function AccountPanel() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-5 rounded-card bg-white p-6 shadow-card sm:p-8">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary-100 font-display text-xl text-primary-700">
          {initials(user.firstName, user.lastName)}
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl text-neutral-700">
            Hola, {user.firstName}
          </h1>
          <p className="truncate text-sm text-neutral-500">{user.email}</p>
          <span className="mt-2 inline-block rounded-full bg-primary-50 px-3 py-1 text-[0.7rem] font-semibold text-primary-700">
            {roleLabels[user.role] ?? user.role}
          </span>
        </div>

        <Button
          variant="outlined"
          isLoading={isLoggingOut}
          onClick={async () => {
            setIsLoggingOut(true);
            await logout();
          }}
        >
          <LogOut className="size-4" />
          Cerrar sesión
        </Button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {[
          { title: "Mis pedidos", detail: "Historial y estado de tus compras." },
          { title: "Direcciones", detail: "Dónde recibes tus productos." },
          { title: "Métodos de pago", detail: "Tarjetas y medios guardados." },
          { title: "Mi consultora", detail: "Tu asesora asignada." },
        ].map((item) => (
          <div key={item.title} className="rounded-card bg-white p-6 shadow-card">
            <h2 className="font-sans text-sm font-semibold text-neutral-700">
              {item.title}
            </h2>
            <p className="mt-1.5 text-xs text-neutral-500">{item.detail}</p>
            <p className="mt-3 text-[0.7rem] text-neutral-400">
              Se conecta cuando el backend exponga el endpoint.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
