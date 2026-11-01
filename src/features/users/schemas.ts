import { z } from "zod";

import { paginationQuerySchema } from "@/lib/pagination";
import { ROLES } from "@/lib/roles";
import {
  atLeastOneField,
  dateTimeSchema,
  emailSchema,
  idParamsSchema,
  idSchema,
  searchSchema,
} from "@/lib/schemas";

// ---- Authentification ----------------------------------------------------

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Identifiant requis").max(64),
  password: z.string().min(1, "Mot de passe requis").max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** Utilisateur connecté, tel que renvoyé par `/api/auth/login` et `/api/auth/me`. */
export const sessionUserSchema = z.object({
  id: idSchema,
  name: z.string(),
  username: z.string(),
  role: z.enum(ROLES),
});
export type SessionUserDto = z.infer<typeof sessionUserSchema>;

// ---- Gestion des comptes (admin) -----------------------------------------

export const userIdParamsSchema = idParamsSchema;

const passwordSchema = z.string().min(8, "8 caractères minimum").max(128, "128 caractères maximum");

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  /** Identifiant de connexion : lettres, chiffres, `.`, `_`, `-`. Stocké en minuscules. */
  username: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(
      z
        .string()
        .min(3)
        .max(32)
        .regex(/^[a-z0-9._-]+$/, "Lettres, chiffres, . _ - uniquement"),
    ),
  password: passwordSchema,
  role: z.enum(ROLES),
  /** Optionnel : généré (`<username>@club.local`) si absent. */
  email: emailSchema.optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = atLeastOneField(
  z
    .object({
      name: createUserSchema.shape.name,
      role: z.enum(ROLES),
      /** Réinitialisation du mot de passe par un admin. */
      password: passwordSchema,
    })
    .partial(),
);
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const listUsersQuerySchema = paginationQuerySchema.extend({
  q: searchSchema.optional(),
  role: z.enum(ROLES).optional(),
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const userSchema = z.object({
  id: idSchema,
  name: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
  createdAt: dateTimeSchema,
});
export type UserDto = z.infer<typeof userSchema>;
