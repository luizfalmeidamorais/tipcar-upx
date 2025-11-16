import z from "zod";

const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/; // BR
const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/; // BR

export const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome completo"),
    phone: z
      .string()
      .min(10, "Telefone inválido")
      .regex(phoneRegex, "Telefone inválido"),
    cpf: z.string().min(11, "CPF inválido").regex(cpfRegex, "CPF inválido"),
    email: z.string().email("Email inválido"),
    password: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres")
      .regex(/[A-Z]/, "Inclua ao menos 1 letra maiúscula")
      .regex(/[a-z]/, "Inclua ao menos 1 letra minúscula")
      .regex(/\d/, "Inclua ao menos 1 número"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não conferem",
  });

export const loginSchema = z.object({
  email: z.email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "A senha é obrigatória" }),
  rememberMe: z.boolean().optional(),
});
