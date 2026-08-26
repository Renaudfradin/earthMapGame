import type { Monument } from "@/types/game";

export function pickRandomUnvisited<T>(
  list: T[],
  visited: T[],
  keyFn: (item: T) => string = String
): T | null {
  const visitedKeys = new Set(visited.map(keyFn));
  const unvisited = list.filter((item) => !visitedKeys.has(keyFn(item)));
  if (unvisited.length === 0) return null;
  return unvisited[Math.floor(Math.random() * unvisited.length)] ?? null;
}

export function pickRandomCountry(
  countries: string[],
  visited: string[]
): string | null {
  return pickRandomUnvisited(countries, visited);
}

export function pickRandomMonument(
  monuments: Monument[],
  visitedMonuments: string[]
): Monument | null {
  const visited = new Set(visitedMonuments);
  const unvisited = monuments.filter((m) => !visited.has(m.monument));
  if (unvisited.length === 0) return null;
  return unvisited[Math.floor(Math.random() * unvisited.length)] ?? null;
}

export const WIN_SCORE = 5;
export const LOSE_SCORE = 5;
export const COUNTRY_JOKERS = 5;
export const MONUMENT_JOKERS = 2;
