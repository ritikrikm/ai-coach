export class AppError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 400, code = "APP_ERROR") {
    super(message);
    (this.status = status), (this.code = code);
  }
}
export class BadRequestError extends AppError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "unauthorized") {
    super((message = "unauthorized"), 401, "UNAUTHORIZED");
  }
}
export class RatelimitError extends AppError {
  constructor(message = "RatelimitError") {
    super((message = "RatelimitError"), 429, "RATE_LIMIT_ERROR");
  }
}
export class InternalError extends AppError {
  constructor(message = "InternalError") {
    super((message = "InternalError"), 500, "INTERNAL_ERROR");
  }
}
