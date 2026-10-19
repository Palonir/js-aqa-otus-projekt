const kolobok = enemy => {
  switch (enemy) {
    case 'grandpa':
      return 'Я от дедушки ушел';
    case 'hare':
      return 'Я от зайца ушел';
    case 'fox':
      return 'Меня съели';
    default:
      return 'Нет таких значений';
  }
};

console.log(kolobok('fox')); // пример использования, чтобы линтер не ругался на неиспользованную функцию

const newYear = personage => `${personage}! ${personage}! ${personage}!`;

console.log(newYear('Дед Мороз')); // пример для того же
