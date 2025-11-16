import { inferAdditionalFields } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const authCLient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), nextCookies()],
});
