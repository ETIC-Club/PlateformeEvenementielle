"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Form, useZodForm } from "@/components/form/form";
import { TextField } from "@/components/form/text-field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api-client";

import { loginSchema, type SessionUserDto } from "../schemas";

/** Redirection post-login : uniquement vers une page interne (évite l'open redirect). */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const form = useZodForm(loginSchema, { defaultValues: { username: "", password: "" } });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Connexion</CardTitle>
        <CardDescription>Plateforme Événementielle</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          form={form}
          submitLabel="Se connecter"
          onSubmit={async (values) => {
            await api.post<{ user: SessionUserDto }>("/api/auth/login", values);
            router.replace(safeNext(searchParams.get("next")));
            router.refresh();
          }}
        >
          <TextField form={form} name="username" label="Identifiant" autoComplete="username" />
          <TextField
            form={form}
            name="password"
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
          />
        </Form>
      </CardContent>
    </Card>
  );
}
