export type Priority = 'high' | 'medium' | 'low'

export type Status = 'open' | 'in_progress' | 'completed'

export interface Assignee {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  plan: 'enterprise' | 'pro' | 'starter'
}

export interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  status: Status
  dueDate: string
  assignee: Assignee
  customer: Customer
  createdAt: string
  updatedAt: string
  tags?: string[]
}

export type CreateTaskPayload = Omit<
  Task,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>

export type UpdateTaskPayload = Partial<
  Omit<Task, 'id' | 'createdAt'>
>

export interface TaskFilters {
  search: string
  priority: Priority | 'all'
  status: Status | 'all'
  assigneeId: string | 'all'
}