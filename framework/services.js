import config from '../framework/config';

const {
  baseURL,
  uri: { userUri, generateTokenUri, authorizedUri, oneBook, listBook }
} = config;

/**
 * Создание пользователя.
 * @param {*} data Данные для создания пользователя.
 */
export async function createUser(data) {
  const res = await fetch(`${baseURL}/${userUri}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  const userID = body.userID;

  return { res, body, userID };
}

/**
 * Генерация токена.
 * @param {*} data Данные для генерации токена.
 */
export async function generateToken(data) {
  const res = await fetch(`${baseURL}/${generateTokenUri}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json();
  const token = body.token;

  return { res, body, token };
}

/**
 * Авторизация пользователя.
 * @param {*} data Данные для авторизации пользователя.
 */
export async function auth(data) {
  const res = await fetch(`${baseURL}/${authorizedUri}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const body = await res.json();

  return { res, body };
}

/**
 * Генерация токена и авторизация пользователя.
 * @param {*} data Данные для авторизации.
 */
export async function authUser(data) {
  const { res: resGenerateToken, token } = await generateToken(data);
  expect(resGenerateToken.status).toBe(200);

  const { res } = await auth(data);
  expect(res.status).toBe(200);

  return { token, res };
}

/**
 * Удаление пользователя.
 * @param {*} token Токен пользователя для авторизации.
 * @param {*} userId ID пользователя для авторизации.
 */
export async function deleteUser(userId, token) {
  const res = await fetch(`${baseURL}/${userUri}/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await res.json();

  return { res, body };
}

/**
 * Получение пользователя.
 * @param {*} userID Идентификатор пользователя.
 * @param {*} token Токен пользователя.
 */
export async function getUser(userID, token) {
  const res = await fetch(`${baseURL}/${userUri}/${userID}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await res.json();

  return { res, body };
}

/**
 * Получение информации о книге.
 * @param {*} ISBN - query-параметр идентификатор книги.
 */
export async function getBook(ISBN) {
  const res = await fetch(`${baseURL}/${oneBook}?ISBN=${ISBN}`, {
    method: 'GET'
  });
  const body = await res.json();

  return { res, body };
}

/**
 * Добавление книги в список пользователя.
 * @param {*} userID Идентификатор пользователя.
 * @param {*} isbn Идентификатор книги.
 * @param {*} token Токен для авторизации.
 */
export async function addBookInUserList(userID, isbn, token) {
  const data = {
    userId: userID,
    collectionOfIsbns: [
      {
        isbn
      }
    ]
  };
  const res = await fetch(`${baseURL}/${listBook}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  const body = await res.json();

  return { res, body };
}

/**
 * Удаление книги из списка пользователя.
 * @param {*} userID Идентификатор пользователя.
 * @param {*} isbn Идентификатор книги.
 * @param {*} token Токен для авторизации.
 */
export async function deleteBookInUserList(userID, isbn, token) {
  const data = {
    isbn,
    userId: userID
  };
  const res = await fetch(`${baseURL}/${oneBook}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  // const body = await res.json();

  return res;
}

/**
 * Замена книги из списка пользователя.
 * @param {*} userID Идентификатор пользователя.
 * @param {*} isbn Идентификатор замещаемой книги.
 * @param {*} replaceIsbn Идентификатор заменяемой книги.
 * @param {*} token Токен для авторизации.
 */
export async function replaceBookInUserList(isbn, userID, replaceIsbn, token) {
  const data = {
    userId: userID,
    isbn: replaceIsbn
  };
  const res = await fetch(`${baseURL}/${listBook}/${isbn}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  const body = await res.json();

  return { res, body };
}
