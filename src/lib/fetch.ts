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

    try {
      const response = await originalFetch.call(globalThis, input, init);
      console.log(`[OUTBOUND FETCH] <- ${response.status} ${response.statusText} (${url})`);

      if (response.status === 403) {
        console.log(
          "[OUTBOUND FETCH] 403 Response Headers:",
          Object.fromEntries(response.headers.entries()),
        );
      }

      return response;
    } catch (error) {
      console.error(`[OUTBOUND FETCH] Error fetching ${url}:`, error);
      throw error;
    }
  };
}
