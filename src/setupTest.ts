import { DI, server, setupDI } from "./server";

export const setupAllTest = async () => {
  await setupDI();
};

export const closeConnections = async () => {
  await DI.orm.close();
  await server.close();
};
