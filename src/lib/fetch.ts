let globalFetch: typeof globalThis.fetch | null = null;

export function patchGlobalFetch(): void {
  if (globalFetch) {
    return;
  }

  const originalFetch = (globalFetch = globalThis.fetch);

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    let url: string;
    let method = init?.method;

    if (typeof input === "string") {
      url = input;
    } else if (input instanceof URL) {
      url = input.toString();
    } else {
      url = input.url;
      method ??= input.method;
    }

    method = (method ?? "GET").toUpperCase();

    console.log(`[OUTBOUND FETCH] -> ${method} ${url}`);

    const headers = new Headers(init?.headers);
    headers.set(
      "User-Agent",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );
    headers.set(
      "Accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    );
    headers.set("Accept-Language", "en-US,en;q=0.5");

    try {
      const response = await originalFetch(input, { ...init, headers });
      console.log(`[OUTBOUND FETCH] <- ${response.status} ${response.statusText} (${url})`);

      if (response.status === 403) {
        console.log(
          "[OUTBOUND FETCH] 403 Response Headers:",
          Object.fromEntries(response.headers.entries()),
        );

        const body = await response.clone().text();
        const excerpt = body.length > 500 ? `${body.slice(0, 500)}... [truncated]` : body;
        console.log("[OUTBOUND FETCH] 403 Response Body:", excerpt);
      }

      return response;
    } catch (error) {
      console.error(`[OUTBOUND FETCH] Error fetching ${url}:`, error);
      throw error;
    }
  };
}
