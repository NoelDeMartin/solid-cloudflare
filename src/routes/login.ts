import { defineRoute } from "../lib/route.ts";

export default defineRoute(async ({ getSession, sessionId, url }) => {
  const error = url.searchParams.get("error");
  if (error) {
    const errorDescription = url.searchParams.get("error_description");
    const message = errorDescription ? `${error}: ${errorDescription}` : error;
    return new Response(`Login error: ${message}\n\nVisit /login to try again.`, {
      status: 400,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const session = await getSession();
  if (session.info.isLoggedIn) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/work" },
    });
  }

  const issuer = url.searchParams.get("issuer");
  if (!issuer) {
    return new Response("Missing 'issuer' query parameter.", { status: 400 });
  }

  let redirectUrl = "";

  await session.login({
    oidcIssuer: issuer,
    clientName: "Cloudflare Hackathon App",
    redirectUrl: `${url.origin}/callback`,
    handleRedirect: (targetUrl) => {
      redirectUrl = targetUrl;
    },
  });

  if (!redirectUrl) {
    return new Response("Failed to obtain redirect URL from login handler", { status: 500 });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl,
      "Set-Cookie": `session_id=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=86400`,
    },
  });
});
