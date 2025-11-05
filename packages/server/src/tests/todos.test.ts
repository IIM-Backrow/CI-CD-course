import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the storage module used by todos.ts
vi.mock('../storage.js', () => ({
  readTodos: vi.fn(),
  writeTodos: vi.fn(),
}));

import { getAllTodos, addTodo, toggleTodo, deleteTodo } from '../todos.js';
import { readTodos, writeTodos } from '../storage.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('todos module', () => {
  it('getAllTodos returns the list from storage', async () => {
    const mock = [{ id: '1', text: 'a', completed: false, createdAt: 't' }];
    (readTodos as any).mockResolvedValue(mock);
    const result = await getAllTodos();
    expect(result).toEqual(mock);
    expect(readTodos).toHaveBeenCalled();
  });

  it('addTodo creates a new todo and writes it', async () => {
    (readTodos as any).mockResolvedValue([]);

    const todo = await addTodo('buy milk');

    expect(todo).toHaveProperty('id');
    expect(todo).toHaveProperty('createdAt');
    expect(todo.text).toBe('buy milk');
    expect(todo.completed).toBe(false);

    expect(writeTodos).toHaveBeenCalled();
    const written = (writeTodos as any).mock.calls[0][0];
    expect(Array.isArray(written)).toBe(true);
    expect(written).toEqual(expect.arrayContaining([expect.objectContaining({ text: 'buy milk' })]));
  });

  it('toggleTodo flips completed when id exists and writes update', async () => {
    const original = { id: '42', text: 'task', completed: false, createdAt: 't' };
    (readTodos as any).mockResolvedValue([original]);

    const updated = await toggleTodo('42');

    expect(updated).toBeDefined();
    expect(updated?.completed).toBe(true);
    expect(writeTodos).toHaveBeenCalled();
    const written = (writeTodos as any).mock.calls[0][0];
    expect(written[0].completed).toBe(true);
  });

  it('toggleTodo returns undefined and does not write when id not found', async () => {
    (readTodos as any).mockResolvedValue([]);
    const result = await toggleTodo('nope');
    expect(result).toBeUndefined();
    expect(writeTodos).not.toHaveBeenCalled();
  });

  it('deleteTodo filters out the todo and writes updated list', async () => {
    const a = { id: '1', text: 'a', completed: false, createdAt: 't' };
    const b = { id: '2', text: 'b', completed: false, createdAt: 't' };
    (readTodos as any).mockResolvedValue([a, b]);

    const res = await deleteTodo('1');

    expect(res).toEqual({ success: true });
    expect(writeTodos).toHaveBeenCalled();
    const written = (writeTodos as any).mock.calls[0][0];
    expect(written).toHaveLength(1);
    expect(written[0].id).toBe('2');
  });
});
