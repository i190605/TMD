import type { Task } from '../types/task'

export function makeTask(overrides: Partial<Task> = {}): Task {
  const id = overrides.id ?? 'task-1'

  return {
    id,
    title: 'Resolve login issue',
    description: 'Investigate and resolve the reported issue.',
    priority: 'high',
    status: 'open',
    dueDate: '2099-12-31',
    assignee: {
      id: 'assignee-1',
      name: 'Maya Chen',
      email: 'maya.chen@example.com',
      ...overrides.assignee,
    },
    customer: {
      id: `customer-${id}`,
      name: 'Acme Customer',
      company: 'Acme Inc.',
      email: 'customer@acme.example',
      plan: 'pro',
      ...overrides.customer,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

export interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T | PromiseLike<T>) => void
  reject: (reason?: unknown) => void
}

export function createDeferred<T>(): Deferred<T> {
  let resolve!: Deferred<T>['resolve']
  let reject!: Deferred<T>['reject']
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}