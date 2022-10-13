import { FastifyReply, FastifyRequest } from "fastify";
import { server } from "../../server";
import { errorController } from "../../utils/errors";
import { CreateUserInput, LoginUserInput } from "./user.schema";
import { registerUser, validUser } from "./user.service";

export const registerUserHandler = async (
  req: FastifyRequest<{ Body: CreateUserInput }>,
  res: FastifyReply
) => {
  const { body } = req;
  try {
    const user = await registerUser(body);
    res.code(201).send(user);
  } catch (e) {
    const error = errorController(e);
    if (error.code === 11000) {
      res.code(400).send({ message: "this email is already in use" });
    }
    res.code(400).send(error);
  }
};

export const loginHandler = async (
  req: FastifyRequest<{ Body: LoginUserInput }>,
  res: FastifyReply
) => {
  const { body } = req;
  try {
    const { user, isValid } = await validUser(body);
    if (!isValid || !user) {
      res.code(400).send({ message: "invalid credentials" });
    }
    const token = server.jwt.sign({ user });
    res.code(200).header("set-cookie", `token=${token}`).send(user);
  } catch (e) {
    const error = errorController(e);
    res.code(400).send(error);
  }
};

export const logoutHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    res.code(200).header("set-cookie", `token=; Max-Age=0`).send({
      message: "logout success",
    });
  } catch (error) {}
};
