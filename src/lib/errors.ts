/** Codes d'erreur stables exposés par l'API. Le front se base dessus, jamais sur le message. */
export const ERROR_CODES = {
  VALIDATION_ERROR: 400,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

/**
 * Erreur "attendue" : à lancer depuis un service (`throw new NotFoundError("Événement introuvable")`).
 * `defineRoute` la convertit en réponse JSON avec le bon statut HTTP.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = ERROR_CODES[code];
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Données invalides", details?: unknown) {
    super("VALIDATION_ERROR", message, details);
  }
}

export class UnauthenticatedError extends AppError {
  constructor(message = "Authentification requise") {
    super("UNAUTHENTICATED", message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Accès refusé") {
    super("FORBIDDEN", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Ressource introuvable") {
    super("NOT_FOUND", message);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflit avec une ressource existante", details?: unknown) {
    super("CONFLICT", message, details);
  }
}
