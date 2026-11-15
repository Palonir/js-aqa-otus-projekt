const defaultPassword = '123456!Aa';
const config = {
  baseURL: 'https://bookstore.demoqa.com',
  uri: {
    userUri: 'Account/v1/User',
    generateTokenUri: 'Account/v1/GenerateToken',
    authorizedUri: 'Account/v1/Authorized',
    oneBook: 'BookStore/v1/Book',
    listBook: 'BookStore/v1/Books'
  },
  defaultUser: {
    userName: 'palonirNew',
    password: defaultPassword,
    userID: '041ff9a3-e5b4-4485-93a4-d4fa3b02f295'
  }
};

export default config;
