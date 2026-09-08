import { defineRoute } from "../lib/route.ts";

export default defineRoute(async ({ getSession }) => {
  const session = await getSession();

  await session.logout();

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": "session_id=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0",
    },
  });
});
