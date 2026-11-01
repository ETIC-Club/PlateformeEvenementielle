import { MOCK_DATE, mockId } from "@/lib/mock";

import type { SessionUserDto, UserDto } from "./schemas";

// Données factices des stubs d'API. À supprimer quand la feature est implémentée.

export const MOCK_USERS: UserDto[] = [
  {
    id: mockId(1),
    name: "Admin du club",
    username: "admin",
    email: "admin@club.local",
    role: "admin",
    createdAt: MOCK_DATE,
  },
  {
    id: mockId(2),
    name: "Agent de scan",
    username: "agent",
    email: "agent@club.local",
    role: "agent",
    createdAt: MOCK_DATE,
  },
];

export const MOCK_SESSION_USER: SessionUserDto = {
  id: MOCK_USERS[0]!.id,
  name: MOCK_USERS[0]!.name,
  username: MOCK_USERS[0]!.username,
  role: "admin",
};
