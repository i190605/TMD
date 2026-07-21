// Replace this file with real API calls in production. All other files stay the same.

import { mockTasks, simulateDelay } from '../data/mockTasks'
import type {
  CreateTaskPayload,
  Status,
  Task,
  UpdateTaskPayload,
} from '../types/task'

export const taskService = {
  async getAll(): Promise<Task[]> {
    await simulateDelay(600)

    return [...mockTasks]
  },

  async getById(id: string): Promise<Task> {
    await simulateDelay(300)

    const task = mockTasks.find((candidate) => candidate.id === id)

    if (!task) {
      throw new Error('Task not found')
    }

    return task
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    await simulateDelay(800)

    const now = new Date().toISOString()
    const task: Task = {
      ...payload,
      id: crypto.randomUUID(),
      status: 'open',
      createdAt: now,
      updatedAt: now,
    }

    mockTasks.push(task)

    return task
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    await simulateDelay(500)

    const taskIndex = mockTasks.findIndex((task) => task.id === id)

    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    const updatedTask: Task = {
      ...mockTasks[taskIndex],
      ...payload,
      updatedAt: new Date().toISOString(),
    }

    mockTasks[taskIndex] = updatedTask

    return updatedTask
  },

  async updateStatus(id: string, status: Status): Promise<Task> {
    return this.update(id, { status })
  },
}