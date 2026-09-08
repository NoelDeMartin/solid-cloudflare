import { defineRoute } from "../lib/route.ts";

export default defineRoute(() => {
  return new Response(
    "Worker is running! Visit /login?issuer=https://[YOUR_POD_PROVIDER] to start.",
  );
});
