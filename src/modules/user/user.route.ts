import {
  DoneFuncWithErrOrRes,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import {
  registerUserHandler,
  loginHandler,
  logoutHandler,
} from "./user.controller";
import { $ref } from "./user.schema";

const userRoute = async (server: FastifyInstance) => {
  server.post(
    "/",
    {
      schema: {
        body: $ref("createUserInputSchema"),
        response: {
          201: $ref("userResponseSchema"),
        },
      },
    },
    registerUserHandler
  );
  server.post(
    "/login",
    {
      schema: {
        body: $ref("loginUserInputSchema"),
        response: {
          200: $ref("userResponseSchema"),
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    loginHandler
  );

  server.post(
    "/logout",
    {
      preHandler: [server.authenticate],
      schema: {
        response: {
          200: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    logoutHandler
  );
};

export default userRoute;
