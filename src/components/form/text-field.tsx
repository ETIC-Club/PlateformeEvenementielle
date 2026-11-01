"use client";

import type { ComponentProps } from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TextFieldProps<TInput extends FieldValues, TOutput extends FieldValues> = {
  form: UseFormReturn<TInput, unknown, TOutput>;
  name: Path<TInput>;
  label: string;
} & Omit<ComponentProps<typeof Input>, "name" | "form">;

/** Champ texte (label + input + message d'erreur Zod). `type` : text, email, password, datetime-local… */
export function TextField<TInput extends FieldValues, TOutput extends FieldValues>({
  form,
  name,
  label,
  ...inputProps
}: TextFieldProps<TInput, TOutput>) {
  const error = form.formState.errors[name]?.message;
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
        {...form.register(name)}
      />
      {typeof error === "string" && (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
