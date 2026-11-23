/** Учётные данные пользователя (тело LoginViewModel из swagger). */
export interface Credentials {
  userName: string;
  password: string;
}

/** Книга из коллекции (GET /Book и элементы books[] в ответах). */
export interface Book {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}

/** Успешный ответ POST /User (создание пользователя). */
export interface CreateUserResponse {
  userID: string;
  username: string;
  books: Book[];
}

/** Профиль пользователя (GET /User, ответ PUT /Books). */
export interface UserProfile {
  userId: string;
  username: string;
  books: Book[];
}

/** Успешный ответ POST /GenerateToken. При неуспехе token/expires приходят null. */
export interface TokenResponse {
  token: string | null;
  expires: string | null;
  status: string;
  result: string;
}

/** Ошибочный ответ API. code — строка, хотя по документации number (баг документации). */
export interface ErrorResponse {
  code: string;
  message: string;
}

/**
 * Любой ответ API — либо ожидаемая полезная нагрузка T, либо ошибка.
 */
export type ApiResult<T> = T | ErrorResponse;
