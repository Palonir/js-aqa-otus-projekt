import config from '../framework/config';
import {
  createUser,
  generateToken,
  auth,
  deleteUser,
  getUser,
  authUser,
  getBook,
  addBookInUserList,
  deleteBookInUserList,
  replaceBookInUserList
} from '../framework/services';

const {
  defaultUser: { userName, password, userID }
} = config;

describe('POST /User', () => {
  it('Успешное создание пользователя', async () => {
    const userName = `palonir_${Date.now()}`;
    const payload = { userName, password };
    const { res, body } = await createUser(payload);

    expect(body.userID).toEqual(expect.any(String)); // не совпадает название поля - userId в сваггере, userID в реальном ответе
    expect(body.username).toBe(userName);
    expect(body.books).toEqual([]);
    expect(res.status).toBe(201);
  });

  it('Ошибка при использовании занятого имени', async () => {
    const payload = { userName, password };
    const { res, body } = await createUser(payload);

    expect(body).toEqual({
      code: '1204',
      message: 'User exists!'
    });
    expect(res.status).toBe(406);
  });

  it('Ошибка при использовании невалидного пароля (без спецсимвола)', async () => {
    const payload = { userName: `palonir_${Date.now()}`, password: '123456Aa' };
    const { res, body } = await createUser(payload);

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
    const { res, body } = await generateToken(payload);

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
    const { res } = await generateToken(payload);

    expect(res.status).toBe(400); // из-за ошибочного статуса преждевременно писать проверки на тело ошибки
  });
});

describe('POST /Authorized', () => {
  it('Авторизация существующего пользователя', async () => {
    const payload = { userName, password };
    const { res } = await auth(payload);

    expect(res.status).toBe(200);
  });

  it('Авторизация существующего пользователя c ошибкой в пароле', async () => {
    const payload = { userName, password: '123456?Aa' };
    const { res, body } = await auth(payload);

    expect(body).toEqual({
      code: '1207', // ошибка типа, по документации number
      message: 'User not found!'
    });
    expect(res.status).toBe(404);
  });

  it('Авторизация несуществующего пользователя', async () => {
    const userName = `palonir_${Date.now()}`;
    const payload = { userName, password };
    const { res, body } = await auth(payload);

    expect(body).toEqual({
      code: '1207', // ошибка типа, по документации number
      message: 'User not found!'
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /User', () => {
  let testUserName;
  let payload;

  it('Удаление существующего юзера', async () => {
    testUserName = `palonir_${Date.now()}`;
    payload = { userName: testUserName, password };

    const { res: resCreateUser, userID } = await createUser(payload);
    expect(resCreateUser.status).toBe(201);

    const { token } = await authUser(payload);

    const { resDeleteUser } = await deleteUser(userID, token);
    // const bodyDeleteUser = await resDeleteUser.json(); // ошибка при парсинге из-за пустого ответа

    // expect(bodyDeleteUser).toEqual({
    //   code: '1207',
    //   message: expect.any(String)
    // });
    expect(resDeleteUser.status).toBe(200); // возвращается статус-код 204
  });
});

describe('GET /User', () => {
  it('Получение существующего пользователя', async () => {
    const payload = { userName, password };
    const { token } = await authUser(payload);

    const { res: resGetUser, body: bodyGetUser } = await getUser(userID, token);
    expect(bodyGetUser).toEqual({
      userId: userID,
      username: userName,
      books: expect.any(Array)
    });
    expect(resGetUser.status).toBe(200);
  }, 60_000);

  it('Получение существующего пользователя без передачи токена', async () => {
    const { res, body } = await getUser(userID);

    expect(body).toEqual({
      code: '1200',
      message: 'User not authorized!'
    });
    expect(res.status).toBe(401);
  });
});

describe('GET /Book', () => {
  const arrBook = ['9781449325862', '9781449331818', '9781449337711', '9781449365035', '9781491904244'];

  for (const book of arrBook) {
    it(`Получение существующей книги с isbn = ${book}`, async () => {
      const { res, body } = await getBook(book);

      expect(body).toEqual({
        isbn: book,
        title: expect.any(String),
        subTitle: expect.any(String),
        author: expect.any(String),
        publish_date: expect.any(String),
        publisher: expect.any(String),
        pages: expect.any(Number),
        description: expect.any(String),
        website: expect.any(String)
      });
      expect(res.status).toBe(200);
    });
  }

  it('Получение несуществующей книги', async () => {
    const { res, body } = await getBook('9999999999999');

    expect(body).toEqual({
      code: '1205',
      message: 'ISBN supplied is not available in Books Collection!'
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /Books', () => {
  const isbn = '9781449325862';
  const payload = { userName, password };

  it('Добавление и удаление существующей книги', async () => {
    const { token } = await authUser(payload);
    const { res, body } = await addBookInUserList(userID, isbn, token);

    // expect(body).toEqual({
    //   isbn
    // }); // тело ответа не соответствует спецификации
    expect(res.status).toBe(201);

    const resDelete = await deleteBookInUserList(userID, isbn, token);

    // expect(bodyDelete).toEqual({
    //   userID,
    //   isbn,
    //   message: ''
    // }); несоответствие спецификации - у метода отсутствует тело ответа
    expect(resDelete.status).toBe(204);
  });

  it('Добавление несуществующей книги', async () => {
    const { token } = await authUser(payload);
    const { res, body } = await addBookInUserList(userID, '9999999999999', token);

    expect(body).toEqual({
      code: '1205',
      message: 'ISBN supplied is not available in Books Collection!'
    });
    expect(res.status).toBe(400);
  });

  it('Добавление книги без авторизации', async () => {
    const { res, body } = await addBookInUserList(userID, isbn);

    expect(body).toEqual({
      code: '1200',
      message: 'User not authorized!'
    });
    expect(res.status).toBe(401);
  });
});

describe('PUT /Books', () => {
  const isbn = '9781449325862';
  const replaceIsbn = '9781449331818';
  const payload = { userName, password };

  it('Замена книги из списка', async () => {
    const { token } = await authUser(payload);

    const { res } = await addBookInUserList(userID, isbn, token);
    expect(res.status).toBe(201);

    const { res: resReplace, body } = await replaceBookInUserList(isbn, userID, replaceIsbn, token);

    expect(body).toEqual({
      userId: userID,
      username: userName,
      books: [
        {
          isbn: replaceIsbn,
          title: expect.any(String),
          subTitle: expect.any(String),
          author: expect.any(String),
          publish_date: expect.any(String),
          publisher: expect.any(String),
          pages: expect.any(Number),
          description: expect.any(String),
          website: expect.any(String)
        }
      ]
    });
    expect(resReplace.status).toBe(200);

    const resDelete = await deleteBookInUserList(userID, replaceIsbn, token);
    expect(resDelete.status).toBe(204);
  });

  it('Замена не добавленной в список книги', async () => {
    const { token } = await authUser(payload);
    const { res, body } = await replaceBookInUserList(isbn, userID, replaceIsbn, token);

    expect(body).toEqual({
      code: '1206',
      message: "ISBN supplied is not available in User's Collection!"
    });
    expect(res.status).toBe(400);
  });

  it('Замена на несуществующую книгу', async () => {
    const { token } = await authUser(payload);
    const { res, body } = await replaceBookInUserList(isbn, userID, '9999999999999', token);

    expect(body).toEqual({
      code: '1205',
      message: 'ISBN supplied is not available in Books Collection!'
    });
    expect(res.status).toBe(400);
  });

  it('Замена книги без авторизации', async () => {
    const { res, body } = await replaceBookInUserList(isbn, userID, replaceIsbn);

    expect(body).toEqual({
      code: '1200',
      message: 'User not authorized!'
    });
    expect(res.status).toBe(401);
  });
});
