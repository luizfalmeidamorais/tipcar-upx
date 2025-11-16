import { headers } from "next/headers";
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { auth } from "@/lib/auth";

export const action = createSafeActionClient({
  handleServerError(e) {
    return e instanceof Error ? e.message : DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

export const authAction = action.use(async ({ next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const user = session?.user;

  if (!user) {
    throw new Error("Usuário não autenticado");
  }

  return next({
    ctx: {
      user,
    },
  });
});
