import type { Session } from "@inrupt/solid-client-authn-node";

export interface RequestContext {
  request: Request;
  env: Env;
  getSession: () => Promise<Session>;
  sessionId: string;
  url: URL;
}

export type RouteHandler = (context: RequestContext) => Response | Promise<Response>;

export function defineRoute(handler: RouteHandler): RouteHandler {
  return handler;
}
