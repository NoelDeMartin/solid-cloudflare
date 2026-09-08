import { Session, getSessionFromStorage, type IStorage } from "@inrupt/solid-client-authn-node";

export async function getSolidSession(sessionId: string, env: Env): Promise<Session> {
  const kvStorage: IStorage = {
    get: async (key) => (await env.SOLID_SESSIONS.get(key)) ?? undefined,
    set: async (key, value) => {
      await env.SOLID_SESSIONS.put(key, value, { expirationTtl: 86400 });
    },
    delete: async (key) => {
      await env.SOLID_SESSIONS.delete(key);
    },
  };

  const session = await getSessionFromStorage(sessionId, { storage: kvStorage });

  return session ?? new Session({ storage: kvStorage }, sessionId);
}
