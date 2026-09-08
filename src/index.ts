import type { RouteHandler } from "./lib/route.ts";
import callback from "./routes/callback.ts";
import index from "./routes/index.ts";
import login from "./routes/login.ts";
import logout from "./routes/logout.ts";
import work from "./routes/work.ts";
import { getSolidSession } from "./lib/session.ts";

const routes = new Map<string, RouteHandler>([
  ["/", index],
  ["/login", login],
  ["/callback", callback],
  ["/work", work],
  ["/logout", logout],
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname.replace(/\/+$/, "") || "/";
    const handler = routes.get(pathname);

    if (!handler) {
      return new Response("Not Found", { status: 404 });
    }

    const sessionId =
      request.headers.get("Cookie")?.match(/(?:^|;\s*)session_id=([^;]+)/)?.[1] ??
      crypto.randomUUID();

    let sessionPromise: ReturnType<typeof getSolidSession> | null = null;
    const getSession = () => (sessionPromise ??= getSolidSession(sessionId, env));

    try {
      return await handler({
        request,
        env,
        getSession,
        sessionId,
        url,
      });
    } catch (error) {
      console.error("Worker unhandled error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return new Response(`Internal Server Error: ${message}`, { status: 500 });
    }
  },
};
