const helloPrefix = 'Hello, ';

export function greet(name: string): string {
  return `${helloPrefix} ${name}!`;
}

console.log(greet('World'));
