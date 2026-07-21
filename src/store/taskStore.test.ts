import { expect, vi } from 'vitest'

import { taskService } from '../services/taskService'
import { createDeferred, makeTask } from '../test/factories'
import type { Task } from '../types/task'
import { useTaskStore } from './taskStore'

function resetStore(tasks: Task[] = []): void {
  useTaskStore.setState({ tasks, loading: false, error: null })
}

describe('taskStore', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    resetStore()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('tracks loading and stores tasks after a successful fetch', async () => {
    const serverTasks = [makeTask()]
    const request = createDeferred<Task[]>()
    vi.spyOn(taskService, 'getAll').mockReturnValue(request.promise)

    const fetchPromise = useTaskStore.getState().fetchTasks()

    expect(useTaskStore.getState()).toMatchObject({
      loading: true,
      error: null,
    })

    request.resolve(serverTasks)
    await fetchPromise

    expect(useTaskStore.getState()).toMatchObject({
      tasks: serverTasks,
      loading: false,
      error: null,
    })
  })

  it('exposes a useful error and stops loading when a fetch fails', async () => {
    vi.spyOn(taskService, 'getAll').mockRejectedValue(new Error('offline'))

    await useTaskStore.getState().fetchTasks()

    expect(useTaskStore.getState()).toMatchObject({
      tasks: [],
      loading: false,
      error: 'Failed to load tasks. Please try again.',
    })
  })

  it('prepends a task returned by create', async () => {
    const existingTask = makeTask({ id: 'existing' })
    const createdTask = makeTask({ id: 'created' })
    resetStore([existingTask])
    const createSpy = vi
      .spyOn(taskService, 'create')
      .mockResolvedValue(createdTask)

    const payload = {
      title: createdTask.title,
      description: createdTask.description,
      priority: createdTask.priority,
      dueDate: createdTask.dueDate,
      assignee: createdTask.assignee,
      customer: createdTask.customer,
      tags: createdTask.tags,
    }
    await expect(useTaskStore.getState().createTask(payload)).resolves.toBe(
      createdTask,
    )

    expect(createSpy).toHaveBeenCalledWith(payload)
    expect(useTaskStore.getState().tasks).toEqual([createdTask, existingTask])
  })

  it('applies an update immediately and reconciles it with the server response', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-21T12:00:00.000Z'))
    const original = makeTask({ id: 'target', title: 'Original title' })
    const untouched = makeTask({ id: 'untouched' })
    const serverTask = makeTask({
      id: 'target',
      title: 'Server-normalized title',
      updatedAt: '2026-07-21T12:00:01.000Z',
    })
    resetStore([original, untouched])
    const request = createDeferred<Task>()
    const updateSpy = vi
      .spyOn(taskService, 'update')
      .mockReturnValue(request.promise)

    const updatePromise = useTaskStore
      .getState()
      .updateTask('target', { title: 'Optimistic title' })

    expect(updateSpy).toHaveBeenCalledWith('target', {
      title: 'Optimistic title',
    })
    expect(useTaskStore.getState().tasks).toEqual([
      {
        ...original,
        title: 'Optimistic title',
        updatedAt: '2026-07-21T12:00:00.000Z',
      },
      untouched,
    ])

    request.resolve(serverTask)
    await updatePromise

    expect(useTaskStore.getState().tasks).toEqual([serverTask, untouched])
  })

  it('rolls an optimistic update back to canonical tasks when the request fails', async () => {
    const original = makeTask({ id: 'target', status: 'open' })
    const canonicalTasks = [original]
    resetStore(canonicalTasks)
    const request = createDeferred<Task>()
    vi.spyOn(taskService, 'update').mockReturnValue(request.promise)
    const reloadSpy = vi
      .spyOn(taskService, 'getAll')
      .mockResolvedValue(canonicalTasks)

    const updatePromise = useTaskStore
      .getState()
      .updateTask('target', { status: 'completed' })
    const rejection = expect(updatePromise).rejects.toThrow('update failed')

    expect(useTaskStore.getState().tasks[0].status).toBe('completed')

    request.reject(new Error('update failed'))
    await rejection

    expect(reloadSpy).toHaveBeenCalledOnce()
    expect(useTaskStore.getState()).toMatchObject({
      tasks: canonicalTasks,
      loading: false,
      error: null,
    })
  })

  it('preserves the original rejection and reports when rollback reloading also fails', async () => {
    const original = makeTask({ id: 'target', status: 'open' })
    resetStore([original])
    const updateError = new Error('update failed')
    vi.spyOn(taskService, 'update').mockRejectedValue(updateError)
    vi.spyOn(taskService, 'getAll').mockRejectedValue(new Error('offline'))

    await expect(
      useTaskStore.getState().updateTask('target', { status: 'completed' }),
    ).rejects.toBe(updateError)

    expect(useTaskStore.getState()).toMatchObject({
      loading: false,
      error: 'Failed to load tasks. Please try again.',
    })
    expect(useTaskStore.getState().tasks[0].status).toBe('completed')
  })

  it('routes status updates through the optimistic update path', async () => {
    const original = makeTask({ id: 'target', status: 'open' })
    const updated = makeTask({ id: 'target', status: 'in_progress' })
    resetStore([original])
    const updateSpy = vi
      .spyOn(taskService, 'update')
      .mockResolvedValue(updated)

    await useTaskStore.getState().updateStatus('target', 'in_progress')

    expect(updateSpy).toHaveBeenCalledWith('target', {
      status: 'in_progress',
    })
    expect(useTaskStore.getState().tasks).toEqual([updated])
  })

  it('clears a previously reported error', () => {
    useTaskStore.setState({ error: 'Previous error' })

    useTaskStore.getState().clearError()

    expect(useTaskStore.getState().error).toBeNull()
  })
})