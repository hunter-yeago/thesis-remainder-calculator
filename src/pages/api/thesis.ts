import type { APIRoute } from 'astro';
import { getState, setState } from '../../lib/state';

const MAX_PAGES = 10000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

const isCount = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

export const GET: APIRoute = async () => json(await getState());

// Body: { pagesLeft?: number, totalPages?: number }; omitted fields keep their current value.
export const POST: APIRoute = async ({ request }) => {
  let body: { pagesLeft?: unknown; totalPages?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body must be JSON like {"pagesLeft": 42}' }, 400);
  }
  const current = await getState();
  const total = body.totalPages ?? current.totalPages;
  const left = body.pagesLeft ?? current.pagesLeft;
  if (!isCount(total) || !isCount(left)) {
    return json({ error: 'pagesLeft and totalPages must be numbers' }, 400);
  }
  const totalPages = Math.round(Math.min(MAX_PAGES, Math.max(1, total)));
  const pagesLeft = Math.round(Math.min(totalPages, Math.max(0, left)));
  return json(await setState(pagesLeft, totalPages));
};
