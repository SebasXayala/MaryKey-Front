import type { Metadata } from "next";

import { AccountPanel } from "@/app/(site)/cuenta/account-panel";
import { RequireAuth } from "@/components/auth/require-auth";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <RequireAuth>
        <AccountPanel />
      </RequireAuth>
    </div>
  );
}
