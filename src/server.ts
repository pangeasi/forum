import "reflect-metadata";
import {
  DoneFuncWithErrOrRes,
  fastify,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import userRoute from "./modules/user/user.route";
import { EntityManager, EntityRepository, MikroORM } from "@mikro-orm/core";
import { User } from "./modules/user/user.entity";
import * as dotenv from "dotenv";
import { userSchemas } from "./modules/user/user.schema";
import fastifyJwt from "@fastify/jwt";
import { TypeOf } from "zod";

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: DoneFuncWithErrOrRes
    ) => void;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { user: User | null }; // payload type is used for signing and verifying
    user: {
      id: string;
      name: string;
      email: string;
    }; // user type is return type of `request.user` object
  }
}

const setupEnv = () => {
  if (process.env.NODE_ENV === "test") {
    return { path: ".env.test" };
  } else if (process.env.NODE_ENV === "development") {
    return { path: ".env.local" };
  }
  console.log(process.env.NODE_ENV);
  return { path: ".env" };
};

dotenv.config({
  ...setupEnv(),
});

const PORT = Number(process.env.PORT || 3000);
export const server = fastify({
  logger: process.env.LOGGER === "true",
});

const entities = [User];
export const DI = {} as {
  orm: MikroORM;
  em: EntityManager;
  userRepository: EntityRepository<User>;
};
export const setupDI = async () => {
  DI.orm = await MikroORM.init({
    clientUrl: "mongodb://localhost:27017",
    dbName: process.env.DBNAME,
    type: "mongo",
    ensureIndexes: true,
    entities,
  });
  DI.em = DI.orm.em.fork();
  DI.userRepository = DI.em.getRepository(User);
};

const start = async () => {
  try {
    await setupDI();
    server.register(fastifyJwt, {
      secret: process.env.JWT_SECRET || "secret",
      formatUser(payload) {
        const {
          user: { password, salt, createdAt, updatedAt, ...rest },
        } = payload as { user: User };

        return {
          ...rest,
        };
      },
    });

    server.decorate(
      "authenticate",
      async (request: FastifyRequest, reply: FastifyReply) => {
        try {
          await request.jwtVerify();
        } catch (e) {
          return reply.code(401).send(e);
        }
      }
    );
    for (const schema of userSchemas) {
      server.addSchema(schema);
    }
    server.register(userRoute, { prefix: "api/user" });
    await server.listen({ port: PORT });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
