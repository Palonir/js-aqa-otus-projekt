import config from '../framework/config';

const {
  baseURL,
  uri: { userUri, generateTokenUri, authorizedUri },
  defaultUser: { userName, password, userID }
} = config;

describe('POST /User', () => {
  it('Успешное создание пользователя', async () => {
    const userName = `palonir_${Date.now()}`;
    const payload = { userName, password };
    const res = await fetch(`${baseURL}/${userUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await res.json();

    expect(body.userID).toEqual(expect.any(String)); // не совпадает название поля - userId в сваггере, userID в реальном ответе
    expect(body.username).toBe(userName);
    expect(body.books).toEqual([]);
    expect(res.status).toBe(201);
  });

  it('Ошибка при использовании занятого имени', async () => {
    const res = await fetch(`${baseURL}/${userUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, password })
    });

    const body = await res.json();

    expect(body).toEqual({
      code: '1204',
      message: 'User exists!'
    });
    expect(res.status).toBe(406);
  });

  it('Ошибка при использовании невалидного пароля (без спецсимвола)', async () => {
    const res = await fetch(`${baseURL}/${userUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: `palonir_${Date.now()}`, password: '123456Aa' })
    });

    const body = await res.json();

    expect(body).toEqual({
      code: '1300',
      message: `Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer.`
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /GenerateToken', () => {
  it('Успешная генерация токена', async () => {
    const payload = { userName, password };
    const res = await fetch(`${baseURL}/${generateTokenUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json();

    expect(body).toEqual({
      token: expect.any(String),
      expires: expect.any(String),
      status: 'Success',
      result: 'User authorized successfully.'
    });
    expect(res.status).toBe(200);
  });

  it('Ошибка при генерации токена (несуществующий юзер)', async () => {
    const payload = { userName: `palonir_${Date.now()}`, password };
    const res = await fetch(`${baseURL}/${generateTokenUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(400); // из-за ошибочного статуса преждевременно писать проверки на тело ошибки
  });
});

describe('POST /Authorized', () => {
  it('Авторизация существующего пользователя', async () => {
    const payload = { userName, password };
    const res = await fetch(`${baseURL}/${authorizedUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    expect(res.status).toBe(200);
  });

  it('Авторизация существующего пользователя c ошибкой в пароле', async () => {
    const payload = { userName, password: '123456?Aa' };
    const res = await fetch(`${baseURL}/${authorizedUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json();
    console.log(body);

    expect(body).toEqual({
      code: '1207', // ошибка типа, по документации number
      message: 'User not found!'
    });
    expect(res.status).toBe(404);
  });

  it('Авторизация несуществующего пользователя', async () => {
    const userName = `palonir_${Date.now()}`;
    const payload = { userName, password };
    const res = await fetch(`${baseURL}/${authorizedUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json();
    console.log(body);

    expect(body).toEqual({
      code: '1207', // ошибка типа, по документации number
      message: 'User not found!'
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /User', () => {
  let testUserName;
  let token;
  let payload;
  let userId;

  it('Удаление существующего юзера', async () => {
    testUserName = `palonir_${Date.now()}`;
    payload = { userName: testUserName, password };
    const resCreateUser = await fetch(`${baseURL}/${userUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    expect(resCreateUser.status).toBe(201);
    const bodyCreateUser = await resCreateUser.json();
    userId = bodyCreateUser.userID;

    // payload = { testUserName, password };
    const resGenerateToken = await fetch(`${baseURL}/${generateTokenUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    expect(resGenerateToken.status).toBe(200);
    const bodyGenerateToken = await resGenerateToken.json();
    token = bodyGenerateToken.token;

    const resDeleteUser = await fetch(`${baseURL}/${userUri}/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    // const bodyDeleteUser = await resDeleteUser.json(); // ошибка при парсинге из-за пустого ответа

    // expect(bodyDeleteUser).toEqual({
    //   code: '1207',
    //   message: expect.any(String)
    // });
    expect(resDeleteUser.status).toBe(200); // возвращается статус-код 204
  });
});

describe('GET /User', () => {
  let token;

  it('Получение существующего пользователя', async () => {
    const payload = { userName, password };
    const resGenerateToken = await fetch(`${baseURL}/${generateTokenUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    expect(resGenerateToken.status).toBe(200);
    const bodyGenerateToken = await resGenerateToken.json();
    token = bodyGenerateToken.token;

    const resGetUser = await fetch(`${baseURL}/${userUri}/${userID}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const bodyGetUser = await resGetUser.json();

    expect(bodyGetUser).toEqual({
      userId: userID,
      username: userName,
      books: expect.any(Array)
    });
    expect(resGetUser.status).toBe(200);
  }, 60_000);

  it('Получение существующего пользователя без передачи токена', async () => {
    const res = await fetch(`${baseURL}/${userUri}/${userID}`, {
      method: 'GET'
    });
    const body = await res.json();

    expect(body).toEqual({
      code: '1200',
      message: 'User not authorized!'
    });
    expect(res.status).toBe(401);
  });
});
