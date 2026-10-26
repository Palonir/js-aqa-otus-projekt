import { nameIsValid, fullTrim, getTotal } from '../src/app';

describe('nameIsValid', () => {
  test.each([
    ['ni', '2 символа'],
    ['nik', '3 символа'],
    ['nikolas', 'обычное имя'],
    ['thisisaverylongnamethatcontainsonlylowercaselettersandnospacesorspecialsymbols', '78 символов']
  ])('Валидный вариант(%p) - %p', input => {
    expect(nameIsValid(input)).toBeTruthy();
  });

  test.each([
    ['n', 'короче 2-х символов'],
    ['Nik', 'c заглавной буквой'],
    ['nikolas1', 'с цифрой'],
    [123456, 'число'],
    ['николай', 'с кириллицей'],
    ['nik olas', 'с пробелом'],
    [null, 'с null'],
    [undefined, 'c undefined']
  ])('Не валидный вариант(%p) - %p', input => {
    expect(nameIsValid(input)).toBeFalsy();
  });
});

describe('fullTrim', () => {
  test.each([
    ['  hello   world  ', 'helloworld'],
    ['a\tb\nc', 'abc'],
    ['', ''],
    [null, ''],
    [undefined, ''],
    ['a\u00A0b', 'ab']
  ])('fullTrim(%p) → %p', (input, expected) => {
    expect(fullTrim(input)).toBe(expected);
  });
});

describe('getTotal', () => {
  test('пустой массив → 0', () => {
    expect(getTotal([])).toBe(0);
  });

  test('сумма без скидки', () => {
    expect(getTotal([{ price: 10, quantity: 10 }])).toBe(100);
  });

  test('несколько позиций', () => {
    expect(
      getTotal([
        { price: 10, quantity: 1 },
        { price: 10, quantity: 9 }
      ])
    ).toBe(100);
  });

  test('скидка 10%', () => {
    expect(getTotal([{ price: 10, quantity: 10 }], 10)).toBe(90);
  });

  test.each([-1, 100, 150])('скидка %p вне диапазона → ошибка', d => {
    expect(() => getTotal([], d)).toThrow('Процент скидки должен быть от 0 до 99');
  });

  test.each(['10', null, {}])('скидка %p не число', d => {
    expect(() => getTotal([], d)).toThrow('Скидка должна быть числом');
  });

  test('скидка 99% — максимум', () => {
    expect(getTotal([{ price: 100, quantity: 1 }], 99)).toBeCloseTo(1);
  });

  test('скидка 1% — минимум', () => {
    expect(getTotal([{ price: 100, quantity: 1 }], 1)).toBe(99);
  });
});
