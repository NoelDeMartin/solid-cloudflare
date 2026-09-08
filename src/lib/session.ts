import { Session, getSessionFromStorage, type IStorage } from "@inrupt/solid-client-authn-node";

function namespacedKey(key: string) {
  return `inrupt:session:${key}`;
}

export async function getSolidSession(sessionId: string, env: Env): Promise<Session> {
  const kvStorage: IStorage = {
    get: async (key) => (await env.SOLID_SESSIONS.get(namespacedKey(key))) ?? undefined,
    set: async (key, value) => {
      await env.SOLID_SESSIONS.put(namespacedKey(key), value, { expirationTtl: 86400 });
    },
    delete: async (key) => {
      await env.SOLID_SESSIONS.delete(namespacedKey(key));
    },
  };

  const session = await getSessionFromStorage(sessionId, { storage: kvStorage });

  return session ?? new Session({ storage: kvStorage }, sessionId);
}
