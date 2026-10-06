import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = process.env.DATA_DIR ?? path.resolve('data');
const FILE = path.join(DATA_DIR, 'thesis.json');

export type ThesisState = { pagesLeft: number; totalPages: number; updatedAt: string | null };

export async function getState(): Promise<ThesisState> {
  try {
    return JSON.parse(await readFile(FILE, 'utf8'));
  } catch {
    return { pagesLeft: 100, totalPages: 100, updatedAt: null };
  }
}

export async function setState(pagesLeft: number, totalPages: number): Promise<ThesisState> {
  const state = { pagesLeft, totalPages, updatedAt: new Date().toISOString() };
  await mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file then rename, so a crash never leaves a half-written file.
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(state));
  await rename(tmp, FILE);
  return state;
}
