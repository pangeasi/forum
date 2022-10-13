import { errorController } from "./errors";

describe("errors utils", () => {
  test("should be return a error with correct properties", () => {
    const error = errorController(new Error("test error"));
    expect(error).toMatchObject({
      message: "test error",
      code: undefined,
      data: undefined,
    });
  });
  test("should be return all properties undefined if pass number", () => {
    const error = errorController(2);
    expect(error).toMatchObject({
      message: null,
      code: undefined,
      data: undefined,
    });
  });

  test("should be return all properties undefined if pass array", () => {
    const error = errorController([1, 2, 3]);
    expect(error).toMatchObject({
      message: null,
      code: undefined,
      data: undefined,
    });
  });

  test("should be return all properties undefined if pass null", () => {
    const error = errorController(null);
    expect(error).toMatchObject({
      message: null,
      code: undefined,
      data: undefined,
    });
  });
});
