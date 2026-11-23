/**
 * Допустимые «преследователи» Колобка.
 *
 * Union из строковых литералов вместо `string`: опечатка в значении теперь
 * невозможна — компилятор знает закрытый набор вариантов, даёт автодополнение
 * и подсвечивает незнакомые строки.
 */
type KolobokEnemy = 'grandpa' | 'hare' | 'fox';

/**
 * Ответ Колобка в зависимости от того, от кого он уходит.
 *
 * `default` из JS-версии ('Нет таких значений') больше не нужен: union покрывает
 * все случаи, и если добавить нового «врага» в тип, TypeScript напомнит,
 * что для него нет ветки в switch.
 */
export const kolobok = (enemy: KolobokEnemy): string => {
  switch (enemy) {
    case 'grandpa':
      return 'Я от дедушки ушел';
    case 'hare':
      return 'Я от зайца ушел';
    case 'fox':
      return 'Меня съели';
  }
};

/** Трижды повторяет имя персонажа — символ наступающего Нового года. */
export const newYear = (personage: string): string => `${personage}! ${personage}! ${personage}!`;
