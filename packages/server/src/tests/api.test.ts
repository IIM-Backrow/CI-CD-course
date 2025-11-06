import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the todos module
vi.mock('../todos.js', () => ({
  getAllTodos: vi.fn(),
  addTodo: vi.fn(),
  toggleTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import { app } from '../index';
import { getAllTodos, addTodo, toggleTodo, deleteTodo } from '../todos';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('API Routes', () => {
  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const mockTodos = [
        { id: '1', text: 'Test todo 1', completed: false, createdAt: '2024-01-01' },
        { id: '2', text: 'Test todo 2', completed: true, createdAt: '2024-01-02' },
      ];
      (getAllTodos as any).mockResolvedValue(mockTodos);

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos);
      expect(getAllTodos).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        id: '3',
        text: 'New todo',
        completed: false,
        createdAt: '2024-01-03',
      };
      (addTodo as any).mockResolvedValue(newTodo);

      const response = await request(app)
        .post('/api/todos')
        .send({ text: 'New todo' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(newTodo);
      expect(addTodo).toHaveBeenCalledWith('New todo');
    });
  });

  describe('PATCH /api/todos/:id', () => {
    it('should toggle a todo', async () => {
      const toggledTodo = {
        id: '1',
        text: 'Test todo',
        completed: true,
        createdAt: '2024-01-01',
      };
      (toggleTodo as any).mockResolvedValue(toggledTodo);

      const response = await request(app).patch('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(toggledTodo);
      expect(toggleTodo).toHaveBeenCalledWith('1');
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const deleteResult = { success: true };
      (deleteTodo as any).mockResolvedValue(deleteResult);

      const response = await request(app).delete('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(deleteResult);
      expect(deleteTodo).toHaveBeenCalledWith('1');
    });
  });
});
