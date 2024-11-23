import { STATUS_CODES, STATUS_CODES_TYPES } from '../constants';

class ApiResponse<T> {
  success: boolean;

  constructor(
    public statusCode: STATUS_CODES_TYPES[keyof STATUS_CODES_TYPES],
    public data: T | null = null,
    public message: string = 'success'
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < STATUS_CODES.BAD_REQUEST;
  }
}

export { ApiResponse };