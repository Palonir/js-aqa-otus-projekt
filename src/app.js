/**
 * Проверка имени пользователя
 * @param {string} name
 * @returns {boolean}
 */
export const nameIsValid = name => typeof name === 'string' && name.length >= 2 && /^[a-z]+$/.test(name);

/**
 * Удаление пробелов из строки
 *
 * @param {string} text
 * @returns {string}
 */
export const fullTrim = text => (text ?? '').replace(/\s+/g, '');

/**
 * Подсчёт суммы заказа
 *
 * @param {[{quantity: number, name?: string, price: number}]} items
 * @param {number} discount
 * @returns {number}
 * @throws Вернёт ошибку, если скидка не число и больше 99 или меньше 0
 * @example getTotal([{ price: 10, quantity: 10 }]) // 100
 * @example getTotal([{ price: 10, quantity: 1 }]) // 10
 * @example getTotal([{ price: 10, quantity: 1 }, { price: 10, quantity: 9 }]) // 100
 * @example getTotal([{ price: 10, quantity: 0 }], { price: 10, quantity: 9 }) // 90
 * @example getTotal([{ price: 10, quantity: 10 }], 10) // 90
 * @example getTotal([{ price: 10, quantity: 10 }], 100) // 0
 */
export const getTotal = (items = [], discount = 0) => {
  if (typeof discount !== 'number') {
    throw new Error('Скидка должна быть числом');
  }
  if (discount < 0 || discount >= 100) {
    throw new Error('Процент скидки должен быть от 0 до 99');
  }

  const total = items.reduce((acc, { price, quantity }) => acc + price * quantity, 0);
  return total * (1 - discount / 100);
};

/**
 * Суммирует числовые значения оценок учащегося.
 *
 * Принимает объект вида `{ [имя]: оценка }` и возвращает сумму всех оценок.
 * Не изменяет переданный объект.
 *
 * @param {Record<string, number>} scores - Объект с оценками: ключ — имя учащегося,
 *   значение — числовая оценка. Должен быть непустым.
 * @returns {number} Сумма всех числовых значений в объекте.
 * @throws {Error} Если `scores` не является объектом, равен `null` или пуст.
 * @throws {Error} Если хотя бы одно значение в объекте не является числом.
 *
 * @example
 * getScore({ Anna: 10, Ivan: 8 }); // 18
 *
 * @example
 * getScore({});          // Error: пустой объект
 * getScore({ Anna: '10' }); // Error: значение не число
 */
export const getScore = scores => {
  if (scores === null || typeof scores !== 'object' || Array.isArray(scores)) {
    throw new Error('Ожидается объект вида { имя: оценка }');
  }

  const keys = Object.keys(scores);
  if (keys.length === 0) {
    throw new Error('Объект с оценками пуст');
  }

  let sum = 0;
  for (const key of keys) {
    const value = scores[key];
    if (!Number.isFinite(value)) {
      const received = value === null ? 'null' : typeof value;
      throw new Error(`Значение по ключу "${key}" должно быть конечным числом, получено: ${received}`);
    }

    sum += value;
  }

  return sum;
};
