export class AppError extends Error {
  constructor(
    message: string,
    public code: string = "INTERNAL_SERVER_ERROR",
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}
