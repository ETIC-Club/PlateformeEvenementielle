"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ReactNode } from "react";
import {
  useForm,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from "react-hook-form";
import type { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";

/**
 * Formulaire validé par un schéma Zod (le MÊME que celui de l'API : `features/<x>/schemas.ts`).
 *
 *   const form = useZodForm(createEventSchema, { defaultValues: { name: "" } });
 *   <Form form={form} submitLabel="Créer" onSubmit={async (values) => { await api.post("/api/events", values); }}>
 *     <TextField form={form} name="name" label="Nom" />
 *   </Form>
 *
 * Si `onSubmit` lance une `ApiError` de validation (400), les erreurs sont affichées sous les bons champs ;
 * toute autre erreur apparaît dans un bandeau au-dessus du bouton.
 */
export function useZodForm<TInput extends FieldValues, TOutput extends FieldValues>(
  schema: z.ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput, unknown, TOutput>, "resolver">,
) {
  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema as z.ZodType<FieldValues, FieldValues>) as Resolver<
      TInput,
      unknown,
      TOutput
    >,
    ...options,
  });
}

type FormProps<TInput extends FieldValues, TOutput extends FieldValues> = {
  form: UseFormReturn<TInput, unknown, TOutput>;
  onSubmit: (values: TOutput) => Promise<void> | void;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
};

export function Form<TInput extends FieldValues, TOutput extends FieldValues>({
  form,
  onSubmit,
  children,
  submitLabel = "Enregistrer",
  className,
}: FormProps<TInput, TOutput>) {
  const [rootError, setRootError] = useState<string | null>(null);
  const { isSubmitting } = form.formState;

  const submit = form.handleSubmit(async (values) => {
    setRootError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        const fieldErrors = Object.entries(error.fieldErrors);
        for (const [field, messages] of fieldErrors) {
          form.setError(field as Path<TInput>, { message: messages[0] });
        }
        if (fieldErrors.length > 0) return;
      }
      setRootError(error instanceof Error ? error.message : "Une erreur est survenue");
    }
  });

  return (
    <form onSubmit={submit} noValidate className={className ?? "space-y-4"}>
      {children}
      {rootError && (
        <Alert variant="destructive">
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Enregistrement…" : submitLabel}
      </Button>
    </form>
  );
}
