import { DI, server } from "../../server";
import { closeConnections, setupAllTest } from "../../setupTest";
import { faker } from "@faker-js/faker";
import { getCookie } from "../../utils/cookies";

beforeAll(async () => {
  await setupAllTest();
  await DI.userRepository.removeAndFlush(await DI.userRepository.findAll());
});
afterAll(async () => {
  await closeConnections();
});
describe("User register", () => {
  test("should be create a user with correct body input and response", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user",
      payload: {
        name: faker.name.firstName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
      },
    });

    expect(res.statusCode).toBe(201);
    expect(res.json()).toHaveProperty("id");
    expect(res.json()).not.toHaveProperty("password");
  });

  test("should be fail with 400 code if try to create a user with invalid password", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user",
      payload: {
        name: faker.name.firstName(),
        password: "1234567",
        email: faker.internet.email(),
      },
    });

    expect(res.statusCode).toBe(400);
  });

  test("should be fail with 400 code if try to create a user without required fields", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user",
      payload: {
        name: faker.name.firstName(),
        password: faker.internet.password(),
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.statusMessage).toBe("Bad Request");
    expect(res.json()).toMatchObject({
      message: "body must have required property 'email'",
    });
  });

  test("should be fail with 400 code if try to create a user with duplicated email", async () => {
    const [user] = await DI.userRepository.find({});
    const res = await server.inject({
      method: "POST",
      url: "/api/user",
      payload: {
        name: faker.name.firstName(),
        password: faker.internet.password(),
        email: user?.email,
      },
    });
    expect(res.statusCode).toBe(400);
    expect(res.statusMessage).toBe("Bad Request");
    expect(res.json()).toMatchObject({
      message: "this email is already in use",
    });
  });
});

describe("User login", () => {
  test("should be login with correct body input and response", async () => {
    const password = faker.internet.password();
    const user = DI.userRepository.create({
      name: faker.name.firstName(),
      password,
      email: faker.internet.email(),
    });
    user.setPassword(password);
    await DI.userRepository.persistAndFlush(user);

    const res = await server.inject({
      method: "POST",
      url: "/api/user/login",
      payload: {
        password: password,
        email: user?.email,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toHaveProperty("id");
    expect(res.headers["set-cookie"]).toMatch(/token=/);
  });

  test("should be fail with 400 code if try to login with invalid credentials", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user/login",
      payload: {
        password: faker.internet.password(),
        email: faker.internet.email(),
      },
    });

    expect(res.statusCode).toBe(400);
    expect(res.statusMessage).toBe("Bad Request");
    expect(res.headers).not.toHaveProperty("set-cookie");
    expect(res.json()).toMatchObject({
      message: "invalid credentials",
    });
  });
});

describe("User logout", () => {
  test("should be logout correctly if user is logged previusly", async () => {
    const password = faker.internet.password();
    const user = DI.userRepository.create({
      name: faker.name.firstName(),
      password,
      email: faker.internet.email(),
    });
    user.setPassword(password);
    await DI.userRepository.persistAndFlush(user);

    const resLogin = await server.inject({
      method: "POST",
      url: "/api/user/login",
      payload: {
        password,
        email: user?.email,
      },
    });

    const resLogout = await server.inject({
      method: "POST",
      url: "/api/user/logout",
      headers: {
        Authorization: `Bearer ${getCookie(
          resLogin.headers["set-cookie"] as string,
          "token"
        )}`,
      },
    });

    expect(resLogout.statusCode).toBe(200);
    expect(resLogout.headers["set-cookie"]).toMatch(/token=; Max-Age=0/);
    expect(resLogout.json()).toMatchObject({
      message: "logout success",
    });
  });

  test("should be fail with 401 code if Authorization header is not passed", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user/logout",
    });

    expect(res.statusCode).toBe(401);
    expect(res.statusMessage).toBe("Unauthorized");
    expect(res.json()).toMatchObject({
      message: "No Authorization was found in request.headers",
    });
  });

  test("should be fail with 401 code if pass a invalid Authorization ", async () => {
    const res = await server.inject({
      method: "POST",
      url: "/api/user/logout",
      headers: {
        Authorization: `Bearer 123`,
      },
    });

    expect(res.statusCode).toBe(401);
    expect(res.statusMessage).toBe("Unauthorized");
    expect(res.json()).toMatchObject({
      message: "The token is malformed.",
    });
  });
});
