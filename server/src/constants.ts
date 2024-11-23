import { CookieOptions } from 'express';

export const DB_NAME = 'CourseSellingApp';

export const MAX_JSON_PAYLOAD_SIZE = '16kb';
export const STATIC_FOLDER_NAME = 'public';

export const STATUS_CODES = {
  CONTINUE: 100,
  SWITCHING_PROTOCOL: 101,
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  REDIRECTED: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type STATUS_CODES_TYPES = typeof STATUS_CODES;

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  signed: true,
  secure: process.env.NODE_ENV === 'development' ? false : true,
};