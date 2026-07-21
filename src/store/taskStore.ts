import { create } from 'zustand'

import { taskService } from '../services/taskService'
import type {
  CreateTaskPayload,
  Status,
  Task,
  UpdateTaskPayload,
} from '../types/task'

export interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  fetchTasks: () => Promise<void>
  createTask: (payload: CreateTaskPayload) => Promise<Task>
  updateTask: (id: string, payload: UpdateTaskPayload) => Promise<void>
  updateStatus: (id: string, status: Status) => Promise<void>
  clearError: () => void
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (): Promise<void> => {
    set({ loading: true, error: null })

    try {
      const tasks = await taskService.getAll()
      set({ tasks, loading: false })
    } catch {
      set({
        loading: false,
        error: 'Failed to load tasks. Please try again.',
      })
    }
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const newTask = await taskService.create(payload)
    set((state) => ({ tasks: [newTask, ...state.tasks] }))

    return newTask
  },

  updateTask: async (
    id: string,
    payload: UpdateTaskPayload,
  ): Promise<void> => {
    const optimisticUpdatedAt = new Date().toISOString()

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...payload, updatedAt: optimisticUpdatedAt }
          : task,
      ),
    }))

    try {
      const updatedTask = await taskService.update(id, payload)

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task,
        ),
      }))
    } catch (error: unknown) {
      await get().fetchTasks()
      throw error
    }
  },

  updateStatus: async (id: string, status: Status): Promise<void> => {
    await get().updateTask(id, { status })
  },

  clearError: (): void => {
    set({ error: null })
  },
}))