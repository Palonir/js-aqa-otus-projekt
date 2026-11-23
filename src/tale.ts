/**
 * Допустимые «преследователи» Колобка.
 */
type KolobokEnemy = 'grandpa' | 'hare' | 'fox';

/**
 * Ответ Колобка в зависимости от того, от кого он уходит.
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
