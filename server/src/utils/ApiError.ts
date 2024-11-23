import { STATUS_CODES_TYPES } from '../constants';

class ApiError extends Error {
  success = false;
  data = null;

  constructor(
    public statusCode: STATUS_CODES_TYPES[keyof STATUS_CODES_TYPES],
    public message: string = 'Something went wrong',
    public errors: string[] | null = null,
    public stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
export { ApiError };