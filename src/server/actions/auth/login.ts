"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { action } from "../_base";
import { loginSchema } from "./schema";

export const login = action
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    const { email, password, rememberMe } = parsedInput;

    try {
      await auth.api.signInEmail({
        body: {
          email,
          password,
          rememberMe,
        },
        headers: await headers(),
      });
    } catch {
      throw new Error("Erro ao fazer login");
    }

    return {
      message: "Login realizado com sucesso!",
    };
  });
