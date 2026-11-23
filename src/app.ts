/**
 * Проверка имени пользователя.
 * @param name значение любого типа
 * @returns true, если строка из 2+ строчных латинских букв
 */
export const nameIsValid = (name: unknown): boolean =>
  typeof name === 'string' && name.length >= 2 && /^[a-z]+$/.test(name);

/**
 * Удаление пробельных символов из строки.
 * @param text строка (может быть null/undefined)
 * @returns строка без пробельных символов; для nullish — пустая строка
 */
export const fullTrim = (text?: string | null): string => (text ?? '').replace(/\s+/g, '');

/** Позиция заказа. */
interface OrderItem {
  quantity: number;
  name?: string;
  price: number;
}

/**
 * Подсчёт суммы заказа.
 * @param items позиции заказа (по умолчанию пустой список)
 * @param discount скидка в процентах, целое число от 0 до 99
 * @returns сумма заказа с учётом скидки
 * @throws Вернёт ошибку, если скидка не число и больше 99 или меньше 0
 * @example getTotal([{ price: 10, quantity: 10 }]) // 100
 * @example getTotal([{ price: 10, quantity: 1 }, { price: 10, quantity: 9 }]) // 100
 * @example getTotal([{ price: 10, quantity: 10 }], 10) // 90
 */
export const getTotal = (items: OrderItem[] = [], discount: unknown = 0): number => {
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
 * Принимает объект вида `{ [имя]: оценка }` и возвращает сумму всех оценок.
 * Не изменяет переданный объект.
 * @param scores - Объект с оценками: ключ — имя учащегося, значение — числовая оценка.
 *   Должен быть непустым.
 * @returns Сумма всех числовых значений в объекте.
 * @throws {Error} Если `scores` не является объектом, равен `null` или пуст.
 * @throws {Error} Если хотя бы одно значение в объекте не является конечным числом.
 *
 * @example
 * getScore({ Anna: 10, Ivan: 8 }); // 18
 *
 * @example
 * getScore({});          // Error: пустой объект
 * getScore({ Anna: '10' }); // Error: значение не число
 */
export const getScore = (scores: unknown): number => {
  if (scores === null || typeof scores !== 'object' || Array.isArray(scores)) {
    throw new Error('Ожидается объект вида { имя: оценка }');
  }

  const entries = Object.entries(scores);
  if (entries.length === 0) {
    throw new Error('Объект с оценками пуст');
  }

  let sum = 0;
  for (const [key, value] of entries) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      const received = value === null ? 'null' : typeof value;
      throw new Error(`Значение по ключу "${key}" должно быть конечным числом, получено: ${received}`);
    }

    sum += value;
  }

  return sum;
};
