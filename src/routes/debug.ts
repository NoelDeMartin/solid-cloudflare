import { defineRoute } from "../lib/route.ts";

export default defineRoute(async ({ env }) => {
  if (String(env.ENVIRONMENT) !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  const list = await env.SOLID_SESSIONS.list();
  const data: Record<string, unknown> = {};

  for (const key of list.keys) {
    data[key.name] = await env.SOLID_SESSIONS.get(key.name);
  }

  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
