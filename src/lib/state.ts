import { env } from 'cloudflare:workers';

const KEY = 'state';

export type ThesisState = { pagesLeft: number; totalPages: number; updatedAt: string | null };

export async function getState(): Promise<ThesisState> {
  return (
    (await env.THESIS.get<ThesisState>(KEY, 'json')) ?? {
      pagesLeft: 100,
      totalPages: 100,
      updatedAt: null,
    }
  );
}

export async function setState(pagesLeft: number, totalPages: number): Promise<ThesisState> {
  const state = { pagesLeft, totalPages, updatedAt: new Date().toISOString() };
  await env.THESIS.put(KEY, JSON.stringify(state));
  return state;
}
