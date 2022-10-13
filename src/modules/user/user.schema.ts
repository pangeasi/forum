import { z } from "zod";
import { buildJsonSchemas } from "fastify-zod";

const createUseCore = {
  email: z.string().email(),
  name: z.string(),
};
const password = z.string().min(8);

const createUserInputSchema = z.object({
  ...createUseCore,
  password,
});

const loginUserInputSchema = z.object({
  email: createUseCore.email,
  password,
});

const userResponseSchema = z.object({
  id: z.string(),
  ...createUseCore,
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type LoginUserInput = z.infer<typeof loginUserInputSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
  loginUserInputSchema,
  createUserInputSchema,
  userResponseSchema,
});
