import { ErrorController } from "../interfaces/errors";

export const errorController = (error: unknown): ErrorController => {
  if (error === null || error === undefined) {
    return {
      message: null,
      code: undefined,
      data: undefined,
    };
  }
  const err = error as ErrorController;
  return {
    message: err.message || null,
    code: err.code,
    data: err.data,
  };
};
