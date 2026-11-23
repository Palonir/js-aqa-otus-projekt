import type { Credentials } from './types';

/**
 * Интерфейс конфигурации.
 *
 * Зачем: без него деструктуризация `const { uri: { userUri } } = config` в services
 * работает «на удаче» — опечатка в ключе даёт undefined в URL и невнятно падающий
 * тест. С интерфейсом опечатка ловится компилятором с точным указанием места.
 */
export interface Config {
  baseURL: string;
  /** Закрытый набор ключей URI — literal union даёт автодополнение и запрет опечаток. */
  uri: Record<'userUri' | 'generateTokenUri' | 'authorizedUri' | 'oneBook' | 'listBook', string>;
  defaultUser: Credentials & { userID: string };
}

const defaultPassword = '123456!Aa';

const config: Config = {
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
