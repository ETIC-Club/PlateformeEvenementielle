import { hashPassword } from "better-auth/crypto";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import { generateQrToken } from "../lib/tokens";

import * as schema from "./schema";

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export type SeedOptions = {
  adminPassword: string;
  agentPassword: string;
};

const DAY = 24 * 60 * 60 * 1000;

// [prénom, nom, organisation, fonction]
const PEOPLE: ReadonlyArray<readonly [string, string, string, string]> = [
  ["Amina", "Benali", "ESI Alger", "Étudiante"],
  ["Yacine", "Boudiaf", "ESI Alger", "Étudiant"],
  ["Sarah", "Khelifi", "USTHB", "Doctorante"],
  ["Mehdi", "Hamidi", "Condor Electronics", "Ingénieur logiciel"],
  ["Lina", "Mansouri", "Djezzy", "Chef de projet"],
  ["Karim", "Belkacem", "Ooredoo", "Data analyst"],
  ["Nadia", "Cherif", "ESI Alger", "Étudiante"],
  ["Rayan", "Meziane", "Startup Algeria", "Fondateur"],
  ["Imane", "Slimani", "USTHB", "Enseignante"],
  ["Walid", "Haddad", "Cevital", "Responsable SI"],
  ["Sofia", "Zerrouki", "ENP Alger", "Étudiante"],
  ["Anis", "Bouzid", "ESI Alger", "Étudiant"],
  ["Yasmine", "Ouali", "Sonatrach", "Ingénieure"],
  ["Farid", "Amrani", "Algérie Télécom", "Architecte réseau"],
  ["Meriem", "Kaci", "ESI Alger", "Étudiante"],
  ["Samir", "Brahimi", "Yassir", "Développeur"],
  ["Hanane", "Taleb", "Université de Blida", "Doctorante"],
  ["Bilal", "Rahmani", "ESI Alger", "Étudiant"],
  ["Celia", "Ait Ahmed", "Ouedkniss", "Product manager"],
  ["Nassim", "Guerfi", "ENP Alger", "Étudiant"],
  ["Dounia", "Saadi", "Mobilis", "Chargée de communication"],
  ["Adel", "Lakhdar", "ESI Alger", "Étudiant"],
  ["Ines", "Berkani", "USTHB", "Étudiante"],
  ["Hocine", "Merabet", "Cosider", "Chef de chantier"],
  ["Rania", "Medjahed", "ESI Alger", "Étudiante"],
  ["Tarek", "Aouadi", "Startup Algeria", "CTO"],
  ["Lydia", "Ferhat", "Université de Béjaïa", "Étudiante"],
  ["Ahmed", "Zidane", "ESI Alger", "Étudiant"],
  ["Khadija", "Boukhalfa", "Djezzy", "Ingénieure QA"],
  ["Oussama", "Remili", "ENP Alger", "Étudiant"],
];

const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

/**
 * Remplit une base VIDE ou existante (efface d'abord les données métier et les comptes).
 * Prend la base en paramètre pour pouvoir être testée sur n'importe quel driver Drizzle.
 */
export async function seed(db: AnyDb, options: SeedOptions) {
  // Cascades : supprimer les événements supprime participants, sessions et scans.
  await db.delete(schema.events);
  await db.delete(schema.users);

  const [adminHash, agentHash] = await Promise.all([
    hashPassword(options.adminPassword),
    hashPassword(options.agentPassword),
  ]);

  const [admin, agent] = await db
    .insert(schema.users)
    .values([
      {
        name: "Admin du club",
        username: "admin",
        displayUsername: "admin",
        email: "admin@club.local",
        emailVerified: true,
        role: "admin",
      },
      {
        name: "Agent de scan",
        username: "agent",
        displayUsername: "agent",
        email: "agent@club.local",
        emailVerified: true,
        role: "agent",
      },
    ])
    .returning();
  if (!admin || !agent) throw new Error("Échec de création des utilisateurs");

  await db.insert(schema.accounts).values([
    { userId: admin.id, accountId: admin.id, providerId: "credential", password: adminHash },
    { userId: agent.id, accountId: agent.id, providerId: "credential", password: agentHash },
  ]);

  const now = Date.now();
  const [openDay, conference] = await db
    .insert(schema.events)
    .values([
      {
        name: "Journée Portes Ouvertes du Club",
        description:
          "Présentation des activités du club, démonstrations et déjeuner de networking.",
        location: "ESI Alger, Amphi A",
        startsAt: new Date(now + 7 * DAY),
      },
      {
        name: "Conférence IA & Société",
        description: "Conférence d'une demi-journée suivie d'ateliers pratiques.",
        location: "USTHB, Salle des conférences",
        startsAt: new Date(now + 21 * DAY),
      },
    ])
    .returning();
  if (!openDay || !conference) throw new Error("Échec de création des événements");

  // 20 participants pour le 1er événement, 10 pour le second.
  const rows = PEOPLE.map(([firstName, lastName, organization, jobTitle], index) => ({
    eventId: index < 20 ? openDay.id : conference.id,
    firstName,
    lastName,
    email: `${slug(firstName)}.${slug(lastName)}@example.com`,
    phone: `+2135${String(50000000 + index * 137911).slice(0, 8)}`,
    organization,
    jobTitle,
    qrToken: generateQrToken(),
  }));
  const participants = await db.insert(schema.participants).values(rows).returning();

  const [entrance, lunch, talkEntrance] = await db
    .insert(schema.scanSessions)
    .values([
      { eventId: openDay.id, name: "Entrée principale", type: "entrance" },
      { eventId: openDay.id, name: "Déjeuner", type: "meal" },
      { eventId: conference.id, name: "Accueil conférence", type: "entrance" },
    ])
    .returning();
  if (!entrance || !lunch || !talkEntrance) throw new Error("Échec de création des sessions");

  const ofEvent = (eventId: string) => participants.filter((p) => p.eventId === eventId);
  const minutesAgo = (m: number) => new Date(now - m * 60 * 1000);

  // Entrée : 12 des 20 participants ; déjeuner : 5 d'entre eux ; accueil conférence : 4 sur 10.
  const scanRows = [
    ...ofEvent(openDay.id)
      .slice(0, 12)
      .map((p, i) => ({
        sessionId: entrance.id,
        participantId: p.id,
        scannedBy: i % 3 === 0 ? admin.id : agent.id,
        scannedAt: minutesAgo(120 - i * 6),
      })),
    ...ofEvent(openDay.id)
      .slice(0, 5)
      .map((p, i) => ({
        sessionId: lunch.id,
        participantId: p.id,
        scannedBy: agent.id,
        scannedAt: minutesAgo(40 - i * 5),
      })),
    ...ofEvent(conference.id)
      .slice(0, 4)
      .map((p, i) => ({
        sessionId: talkEntrance.id,
        participantId: p.id,
        scannedBy: agent.id,
        scannedAt: minutesAgo(30 - i * 4),
      })),
  ];
  await db.insert(schema.scans).values(scanRows);

  return {
    users: 2,
    events: 2,
    participants: participants.length,
    sessions: 3,
    scans: scanRows.length,
    sampleScanned: ofEvent(openDay.id)[0]?.qrToken,
    sampleNotScanned: ofEvent(openDay.id)[19]?.qrToken,
  };
}
