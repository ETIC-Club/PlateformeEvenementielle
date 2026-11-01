import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { ROLES } from "../lib/roles";
import { generateQrToken } from "../lib/tokens";

// Les colonnes sont écrites en camelCase ici ; Drizzle les mappe en snake_case en base
// (option `casing: "snake_case"`). Voir docs/DATABASE.md.
// IMPORTANT : imports relatifs uniquement dans ce dossier (drizzle-kit ne résout pas "@/").

const id = () => uuid().primaryKey().defaultRandom();
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", ROLES);

export const SCAN_SESSION_TYPES = ["entrance", "meal", "workshop", "vip", "other"] as const;
export type ScanSessionType = (typeof SCAN_SESSION_TYPES)[number];
export const scanSessionTypeEnum = pgEnum("scan_session_type", SCAN_SESSION_TYPES);

// ---------------------------------------------------------------------------
// Authentification (compatible Better Auth : tables users / sessions / accounts / verifications)
// Ne pas renommer ces colonnes sans vérifier la config Better Auth (src/lib/auth).
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: id(),
  name: text().notNull(),
  username: text().notNull().unique(), // identifiant de connexion
  displayUsername: text(),
  email: text().notNull().unique(), // requis par Better Auth ; peut être fictif (xxx@club.local)
  emailVerified: boolean().notNull().default(false),
  image: text(),
  role: userRoleEnum().notNull().default("agent"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("sessions_user_id_idx").on(t.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text().notNull(),
    providerId: text().notNull(), // "credential" pour identifiant / mot de passe
    password: text(), // hash (jamais en clair)
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("accounts_user_id_idx").on(t.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: id(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

// ---------------------------------------------------------------------------
// Métier
// ---------------------------------------------------------------------------

export const events = pgTable("events", {
  id: id(),
  name: text().notNull(),
  description: text(),
  location: text(),
  startsAt: timestamp({ withTimezone: true }).notNull(),
  /** URL (Vercel Blob) de l'image de fond des badges de cet événement. Null = badge par défaut. */
  badgeBackgroundUrl: text(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const participants = pgTable(
  "participants",
  {
    id: id(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    firstName: text().notNull(),
    lastName: text().notNull(),
    email: text().notNull(), // le service le normalise en minuscules
    phone: text(),
    organization: text(),
    jobTitle: text(),
    /** Contenu du QR code. Généré automatiquement, unique, non devinable. */
    qrToken: text().notNull().unique("participants_qr_token_unique").$defaultFn(generateQrToken),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    // Anti-doublon d'inscription (import Excel compris), insensible à la casse.
    uniqueIndex("participants_event_email_uidx").on(t.eventId, sql`lower(${t.email})`),
    index("participants_event_last_name_idx").on(t.eventId, t.lastName),
  ],
);

export const scanSessions = pgTable(
  "scan_sessions",
  {
    id: id(),
    eventId: uuid()
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text().notNull(), // ex. "Entrée principale", "Déjeuner", "Atelier IA"
    type: scanSessionTypeEnum().notNull().default("other"),
    /** Une session fermée n'accepte plus de scans mais garde son historique. */
    isActive: boolean().notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("scan_sessions_event_name_uidx").on(t.eventId, t.name)],
);

export const scans = pgTable(
  "scans",
  {
    id: id(),
    sessionId: uuid()
      .notNull()
      .references(() => scanSessions.id, { onDelete: "cascade" }),
    participantId: uuid()
      .notNull()
      .references(() => participants.id, { onDelete: "cascade" }),
    /** Agent (ou admin) qui a scanné. Null si le compte a été supprimé depuis (l'historique reste). */
    scannedBy: uuid().references(() => users.id, { onDelete: "set null" }),
    scannedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // UN scan par participant et par session. Un doublon lève l'erreur 23505 / ON CONFLICT.
    uniqueIndex("scans_session_participant_uidx").on(t.sessionId, t.participantId),
    index("scans_session_scanned_at_idx").on(t.sessionId, t.scannedAt),
    index("scans_participant_idx").on(t.participantId),
    index("scans_scanned_by_idx").on(t.scannedBy),
  ],
);

// ---------------------------------------------------------------------------
// Relations (pour db.query.*.findMany({ with: { ... } }))
// ---------------------------------------------------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  scans: many(scans),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(participants),
  scanSessions: many(scanSessions),
}));

export const participantsRelations = relations(participants, ({ one, many }) => ({
  event: one(events, { fields: [participants.eventId], references: [events.id] }),
  scans: many(scans),
}));

export const scanSessionsRelations = relations(scanSessions, ({ one, many }) => ({
  event: one(events, { fields: [scanSessions.eventId], references: [events.id] }),
  scans: many(scans),
}));

export const scansRelations = relations(scans, ({ one }) => ({
  session: one(scanSessions, { fields: [scans.sessionId], references: [scanSessions.id] }),
  participant: one(participants, { fields: [scans.participantId], references: [participants.id] }),
  scanner: one(users, { fields: [scans.scannedBy], references: [users.id] }),
}));

// ---------------------------------------------------------------------------
// Types inférés
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
export type ScanSession = typeof scanSessions.$inferSelect;
export type NewScanSession = typeof scanSessions.$inferInsert;
export type Scan = typeof scans.$inferSelect;
export type NewScan = typeof scans.$inferInsert;
