Создано в рамках курса OTUS JavaScript QA Engineer

## О проекте

Учебный проект автоматизации тестирования API BookStore (DemoQA):

- `src/` — проверяемый код: чистые функции-валидаторы и учебные задачи;
- `framework/` — самодельный тестовый фреймворк: конфигурация, fetch-обёртки над API,
  доменные типы;
- `specs/` — юнит-тесты и API-тесты;
- `swagger.json` — OpenAPI-спецификация тестируемого API.

Проект написан на **TypeScript** (миграция с JavaScript описана в
[MIGRATION.md](./MIGRATION.md)). Работает в нативном ESM-режиме
(`"type": "module"` + `--experimental-vm-modules`).

## Стек

- TypeScript (strict), ts-jest
- Jest 30 + allure-jest (отчёты Allure)
- response-openapi-validator (валидация ответов по swagger)
- ESLint (typescript-eslint) + Prettier

## Команды

```bash
npm test            # тесты (юнит + API)
npm run typecheck   # проверка типов во всём проекте
npm run lint:ci     # проверка линтером
npm run lint        # линтер с автоисправлением
npm start           # демо-скрипт приветствия
npm run allure:report  # отчёт Allure по последнему прогону
```
