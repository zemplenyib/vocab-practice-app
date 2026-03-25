import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { ListNameSchema } from '@vocab/shared';
import * as listService from '../services/listService.js';

const router = new Hono();

router.get('/', async (c) => {
  const lists = await listService.getAllLists();
  return c.json(lists);
});

router.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const list = await listService.getListByIdWithCount(id);
  if (!list) return c.json({ error: 'List not found' }, 404);
  return c.json(list);
});

router.post('/', zValidator('json', ListNameSchema), async (c) => {
  const { name } = c.req.valid('json');
  const result = await listService.createList(name);
  if (result.error === 'protected') return c.json({ error: 'Cannot modify the default list' }, 400);
  if (result.error === 'duplicate') return c.json({ error: 'A list with that name already exists' }, 409);
  return c.json(result.list, 201);
});

router.put('/:id', zValidator('json', ListNameSchema), async (c) => {
  const id = Number(c.req.param('id'));
  const { name } = c.req.valid('json');
  const result = await listService.renameList(id, name);
  if (result.error === 'protected') return c.json({ error: 'Cannot modify the default list' }, 400);
  if (result.error === 'notfound') return c.json({ error: 'List not found' }, 404);
  if (result.error === 'duplicate') return c.json({ error: 'A list with that name already exists' }, 409);
  return c.json(result.list);
});

router.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const deleted = await listService.deleteList(id);
  if (!deleted) return c.json({ error: 'List not found' }, 404);
  return c.json({ ok: true });
});

router.post('/:id/words/:wordId', async (c) => {
  const listId = Number(c.req.param('id'));
  const wordId = Number(c.req.param('wordId'));
  const result = await listService.linkWord(listId, wordId);
  if (result.error === 'listNotFound') return c.json({ error: 'List not found' }, 404);
  if (result.error === 'wordNotFound') return c.json({ error: 'Word not found' }, 404);
  return c.json({ ok: true });
});

router.delete('/:id/words/:wordId', async (c) => {
  const listId = Number(c.req.param('id'));
  const wordId = Number(c.req.param('wordId'));
  const unlinked = await listService.unlinkWord(listId, wordId);
  if (!unlinked) return c.json({ error: 'Link not found' }, 404);
  return c.json({ ok: true });
});

export default router;
