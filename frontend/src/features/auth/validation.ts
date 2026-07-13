import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .regex(/^[a-z0-9]*$/, "Username must contain small letters or digits."),
  password: z
    .string()
    .min(1, "Password is required")
    .min(4, "Password should be of minimum 4 characters length"),
});

export type LoginValues = z.infer<typeof loginSchema>;
