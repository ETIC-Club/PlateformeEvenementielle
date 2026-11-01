import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/users/components/login-form";
import { getCurrentUser } from "@/lib/auth/session";
import { HOME_BY_ROLE } from "@/lib/routes";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(HOME_BY_ROLE[user.role]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
