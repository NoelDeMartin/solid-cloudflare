import { defineRoute } from "../lib/route.ts";

export default defineRoute(async ({ getSession, request, url }) => {
  const error = url.searchParams.get("error");
  if (error) {
    const errorDescription = url.searchParams.get("error_description");
    const location = `/login?error=${encodeURIComponent(error)}${
      errorDescription ? `&error_description=${encodeURIComponent(errorDescription)}` : ""
    }`;
    return new Response(null, {
      status: 302,
      headers: { Location: location },
    });
  }

  try {
    const session = await getSession();

    await session.handleIncomingRedirect(request.url);

    if (!session.info.isLoggedIn) {
      return new Response(null, {
        status: 302,
        headers: {
          Location:
            "/login?error=unauthenticated&error_description=Session+could+not+be+authenticated",
        },
      });
    }

    const sessionId = session.info.sessionId;

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/work",
        "Set-Cookie": `session_id=${sessionId}; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=86400`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication failed";
    return new Response(null, {
      status: 302,
      headers: {
        Location: `/login?error=auth_failed&error_description=${encodeURIComponent(message)}`,
      },
    });
  }
});
