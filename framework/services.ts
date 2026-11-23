import config from './config';
import type {
  ApiResult,
  Book,
  Credentials,
  CreateUserResponse,
  ErrorResponse,
  TokenResponse,
  UserProfile
} from './types';

/**
 * Единая форма возврата всех API-функций: сырой Response + уже распарсенное тело.
 * Дженерик B — тип тела ответа, который каждая функция уточняет сама.
 */
interface ApiCall<B> {
  res: Response;
  body: B;
}

/**
 * Безопасное чтение JSON-тела ответа.
 *
 * Зачем: `res.json()` бросает SyntaxError, если тело пустое. Например, DELETE /User
 * возвращает 204 No Content без тела — «голый» json() падал прямо в сервисе,
 * и тест удаления пользователя был красным (см. MIGRATION.md, «Вынужденные исправления»).
 */
async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) {
    return null;
  }
  return JSON.parse(text) as unknown;
}

/** Обёртка над fetch: общие для всех запросов baseURL, JSON-заголовки и сериализация тела. */
async function apiFetch(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, init);
}

/**
 * Создание пользователя.
 * @param data Учётные данные нового пользователя.
 */
export async function createUser(data: Credentials): Promise<ApiCall<ApiResult<CreateUserResponse>>> {
  const res = await apiFetch(`${config.baseURL}/${config.uri.userUri}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = (await parseJsonBody(res)) as ApiResult<CreateUserResponse>;

  return { res, body };
}

/**
 * Генерация токена.
 * @param data Учётные данные пользователя.
 */
export async function generateToken(data: Credentials): Promise<ApiCall<ApiResult<TokenResponse>>> {
  const res = await apiFetch(`${config.baseURL}/${config.uri.generateTokenUri}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = (await parseJsonBody(res)) as ApiResult<TokenResponse>;

  return { res, body };
}

/**
 * Авторизация пользователя.
 * @param data Учётные данные пользователя.
 */
export async function auth(data: Credentials): Promise<ApiCall<ApiResult<boolean>>> {
  const res = await apiFetch(`${config.baseURL}/${config.uri.authorizedUri}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = (await parseJsonBody(res)) as ApiResult<boolean>;

  return { res, body };
}

/**
 * Генерация токена и авторизация пользователя.
 *
 * Это ассерт-хелпер: он гарантирует либо строку токена, либо падение с понятной
 * ошибкой (раньше при token: null тесты молча отправляли заголовок 'Bearer null').
 *
 * NOTE (технический долг, вне скоупа миграции): expect() внутри сервисного слоя —
 * антипаттерн, сервис перестаёт быть переиспользуемым вне тестов. Оставлено
 * как есть, чтобы миграция не меняла поведение.
 * @param data Учётные данные для авторизации.
 */
export async function authUser(data: Credentials): Promise<{ token: string; res: Response }> {
  const { res: resGenerateToken, body } = await generateToken(data);
  expect(resGenerateToken.status).toBe(200);

  const { res } = await auth(data);
  expect(res.status).toBe(200);

  // API возвращает 200 даже при логической ошибке (status: 'Failed', token: null),
  // поэтому после expect(200) сужение через as оправдано, но токен проверяем явно.
  const token = (body as TokenResponse).token;
  if (typeof token !== 'string') {
    throw new Error(`authUser: токен не получен, ответ API: ${JSON.stringify(body)}`);
  }

  return { token, res };
}

/**
 * Удаление пользователя.
 * @param userId Идентификатор пользователя.
 * @param token Токен пользователя для авторизации.
 */
export async function deleteUser(userId: string, token: string): Promise<ApiCall<ErrorResponse | null>> {
  const res = await apiFetch(`${config.baseURL}/${config.uri.userUri}/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = (await parseJsonBody(res)) as ErrorResponse | null;

  return { res, body };
}

/**
 * Получение пользователя.
 * @param userID Идентификатор пользователя.
 * @param token Токен пользователя. Может не передаваться — негативные тесты
 *   проверяют доступ без авторизации.
 */
export async function getUser(userID: string, token?: string): Promise<ApiCall<ApiResult<UserProfile>>> {
  const res = await apiFetch(`${config.baseURL}/${config.uri.userUri}/${userID}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = (await parseJsonBody(res)) as ApiResult<UserProfile>;

  return { res, body };
}

/**
 * Получение информации о книге.
 * @param ISBN query-параметр, идентификатор книги.
 */
export async function getBook(ISBN: string): Promise<ApiCall<ApiResult<Book>>> {
  const res = await apiFetch(`${config.baseURL}/${config.uri.oneBook}?ISBN=${ISBN}`, {
    method: 'GET'
  });
  const body = (await parseJsonBody(res)) as ApiResult<Book>;

  return { res, body };
}

/**
 * Добавление книги в список пользователя.
 * @param userID Идентификатор пользователя.
 * @param isbn Идентификатор книги.
 * @param token Токен для авторизации. Может не передаваться — негативные тесты
 *   проверяют доступ без авторизации.
 */
export async function addBookInUserList(
  userID: string,
  isbn: string,
  token?: string
): Promise<ApiCall<ApiResult<UserProfile>>> {
  const data = {
    userId: userID,
    collectionOfIsbns: [
      {
        isbn
      }
    ]
  };
  const res = await apiFetch(`${config.baseURL}/${config.uri.listBook}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  const body = (await parseJsonBody(res)) as ApiResult<UserProfile>;

  return { res, body };
}

/**
 * Удаление книги из списка пользователя.
 * Возвращает только Response: у DELETE /Book нет тела ответа (см. комментарий в тестах).
 * @param userID Идентификатор пользователя.
 * @param isbn Идентификатор книги.
 * @param token Токен для авторизации.
 */
export async function deleteBookInUserList(userID: string, isbn: string, token: string): Promise<Response> {
  const data = {
    isbn,
    userId: userID
  };
  const res = await apiFetch(`${config.baseURL}/${config.uri.oneBook}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });

  return res;
}

/**
 * Замена книги из списка пользователя.
 * @param isbn Идентификатор замещаемой книги.
 * @param userID Идентификатор пользователя.
 * @param replaceIsbn Идентификатор новой книги.
 * @param token Токен для авторизации. Может не передаваться — негативные тесты
 *   проверяют доступ без авторизации.
 */
export async function replaceBookInUserList(
  isbn: string,
  userID: string,
  replaceIsbn: string,
  token?: string
): Promise<ApiCall<ApiResult<UserProfile>>> {
  const data = {
    userId: userID,
    isbn: replaceIsbn
  };
  const res = await apiFetch(`${config.baseURL}/${config.uri.listBook}/${isbn}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  const body = (await parseJsonBody(res)) as ApiResult<UserProfile>;

  return { res, body };
}
