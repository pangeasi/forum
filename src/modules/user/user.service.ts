import { DI } from "../../server";
import { User } from "./user.entity";
import { CreateUserInput, LoginUserInput } from "./user.schema";

export const registerUser = async ({
  password,
  ...rest
}: CreateUserInput): Promise<User> => {
  const user = DI.userRepository.create(rest);
  user.setPassword(password);

  await DI.userRepository.persistAndFlush(user);
  return user;
};

export const validUser = async ({ email, password }: LoginUserInput) => {
  const user = await DI.userRepository.findOne({ email });
  return { user, isValid: user?.validatePassword(password) };
};
