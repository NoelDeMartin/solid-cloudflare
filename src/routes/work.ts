import { defineRoute } from "../lib/route.ts";

export default defineRoute(async ({ getSession }) => {
  const session = await getSession();

  if (!session.info.isLoggedIn) {
    return new Response("Not logged in. Go to /login", { status: 401 });
  }

  const webId = session.info.webId;
  if (!webId) {
    return new Response("Logged in, but no WebID found", { status: 500 });
  }

  // FIXME: Discovering the storage URL from the WebID profile document (via pim:storage)
  // is the proper way to locate the user's POD root.
  // Assuming the WebID path ends with "profile/card" (standard for Node Solid Server) or falling back
  // to {origin}/cloudflare/test.txt may not work for providers with arbitrary storage paths.
  const webIdUrl = new URL(webId);
  const targetUrl = webIdUrl.pathname.endsWith("/profile/card")
    ? webIdUrl.origin + webIdUrl.pathname.replace("profile/card", "cloudflare/test.txt")
    : `${webIdUrl.origin}/cloudflare/test.txt`;

  const writeResponse = await session.fetch(targetUrl, {
    method: "PUT",
    headers: { "Content-Type": "text/plain" },
    body: `Hello from the Edge! Written by ${webId} at ${new Date().toISOString()}`,
  });

  if (!writeResponse.ok) {
    return new Response(
      `Failed to write to POD. Status: ${writeResponse.status} ${writeResponse.statusText}`,
      { status: 500 },
    );
  }

  return new Response(
    `Success! 🚀\n\nData written to: ${targetUrl}\nStatus: ${writeResponse.status}\n\nGo check your POD!`,
  );
});
