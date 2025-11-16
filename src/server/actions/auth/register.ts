"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { action } from "../_base";
import { registerSchema } from "./schema";

export const registerAction = action
  .inputSchema(registerSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password } = parsedInput;

    try {
      await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
          callbackURL: "/email-verified",
        },
        headers: await headers(),
      });
    } catch {
      throw new Error("Erro ao criar conta");
    }

    return {
      message:
        "Conta criada com sucesso! Verifique seu email para ativar sua conta.",
    };
  });
