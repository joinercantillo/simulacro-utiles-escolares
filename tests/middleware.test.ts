import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { authenticateToken, authorizeRoles } from "../src/middlewares/auth";
import { UserRole } from "../src/interfaces";

const mockUser = {
  id: 1,
  email: "admin@riwimed.co",
  role: UserRole.ADMIN,
};

function buildRequest(token?: string): Request {
  const req = {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  } as unknown as Request;
  return req;
}

function buildResponse(): { res: Response; statusCode: () => number; jsonBody: () => any } {
  const result = { statusCode: 0, jsonBody: {} };
  const res = {
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    json(body: any) {
      result.jsonBody = body;
      return this;
    },
  } as unknown as Response;
  return {
    res,
    statusCode: () => result.statusCode,
    jsonBody: () => result.jsonBody,
  };
}

function buildNext(): jest.Mock {
  return jest.fn();
}

describe("Middleware de autenticación con JWT", () => {
  test("debe rechazar peticiones sin token", () => {
    const { res, statusCode } = buildResponse();
    const next = buildNext();

    const invalidRequest = buildRequest(undefined);
    authenticateToken(invalidRequest, res, next);

    expect(statusCode()).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("debe rechazar tokens inválidos", () => {
    const { res, statusCode } = buildResponse();
    const next = buildNext();

    authenticateToken(buildRequest("token-invalido"), res, next);

    expect(statusCode()).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("debe aceptar un token válido y adjuntar el usuario", () => {
    const token = jwt.sign(mockUser, "secret", { expiresIn: "1h" });
    const { res, statusCode } = buildResponse();
    const next = buildNext();

    const request = buildRequest(token) as Request & { user?: typeof mockUser };
    authenticateToken(request, res, next);

    expect(statusCode()).toBe(0);
    expect(next).toHaveBeenCalledTimes(1);
    expect(request.user?.email).toBe("admin@riwimed.co");
  });
});

describe("Middleware de autorización por roles", () => {
  test("debe negar acceso a un usuario gestor en rutas de admin", () => {
    const { res, statusCode } = buildResponse();
    const next = buildNext();

    const request = ({
      user: { id: 2, email: "gestor@riwimed.co", role: UserRole.GESTOR },
    } as unknown) as Request & { user?: typeof mockUser };

    const guard = authorizeRoles(UserRole.ADMIN);
    guard(request, res, next);

    expect(statusCode()).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("debe permitir el paso al administrador", () => {
    const { res, statusCode } = buildResponse();
    const next = buildNext();

    const request = ({ user: mockUser } as unknown) as Request & {
      user?: typeof mockUser;
    };

    const guard = authorizeRoles(UserRole.ADMIN);
    guard(request, res, next);

    expect(statusCode()).toBe(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("debe rechazar cuando el usuario no está autenticado", () => {
    const { res, statusCode } = buildResponse();
    const next = buildNext();

    const guard = authorizeRoles(UserRole.ADMIN);
    guard(buildRequest() as Request, res, next);

    expect(statusCode()).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });
});