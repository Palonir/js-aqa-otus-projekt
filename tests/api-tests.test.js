const baseURL = 'https://bookstore.demoqa.com/Account/v1';
const createUserUri = 'User';
const generateTokenUri = 'GenerateToken';
const validPassword = '123456!Aa';
const existUser = 'palonir';

describe('POST /User', () => {
  it('Успешное создание пользователя', async () => {
    const userName = `palonir_${Date.now()}`;
    const payload = { userName, password: validPassword };
    const res = await fetch(`${baseURL}/${createUserUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.userID).toEqual(expect.any(String)); // не совпадает название поля - userId в сваггере, userID в реальном ответе
    expect(body.username).toBe(userName);
    expect(body.books).toEqual([]);
  });

  it('Ошибка при использовании занятого имени', async () => {
    const res = await fetch(`${baseURL}/${createUserUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: existUser, password: validPassword })
    });

    const body = await res.json();

    expect(res.status).toBe(406);
    expect(body).toEqual({
      code: '1204',
      message: 'User exists!'
    });
  });

  it('Ошибка при использовании невалидного пароля (без спецсимвола)', async () => {
    const res = await fetch(`${baseURL}/${createUserUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName: `palonir_${Date.now()}`, password: '123456Aa' })
    });

    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body).toEqual({
      code: '1300',
      message: `Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer.`
    });
  });
});

describe('POST /GenerateToken', () => {
  it('Успешная генерация токена', async () => {
    const payload = { userName: existUser, password: validPassword };
    const res = await fetch(`${baseURL}/${generateTokenUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      token: expect.any(String),
      expires: expect.any(String),
      status: 'Success',
      result: 'User authorized successfully.'
    });
  });

  it('Ошибка при генерации токена (несуществующий юзер)', async () => {
    const payload = { userName: `palonir_${Date.now()}`, password: validPassword };
    const res = await fetch(`${baseURL}/${generateTokenUri}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json();

    expect(res.status).toBe(400); // из-за ошибочного статуса преждевременно писать проверки на тело ошибки
  });
});
