import type {
  Assignee,
  Priority,
  Status,
  TaskFilters,
} from '../types/task'

export interface PriorityConfig {
  label: string
  color: string
  icon: string
}

export interface StatusConfig {
  label: string
  color: string
}

export const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
  high: {
    label: 'High',
    color: 'red',
    icon: 'CircleAlert',
  },
  medium: {
    label: 'Medium',
    color: 'amber',
    icon: 'CircleMinus',
  },
  low: {
    label: 'Low',
    color: 'emerald',
    icon: 'ArrowDown',
  },
}

export const STATUS_CONFIG: Record<Status, StatusConfig> = {
  open: {
    label: 'Open',
    color: 'slate',
  },
  in_progress: {
    label: 'In Progress',
    color: 'blue',
  },
  completed: {
    label: 'Completed',
    color: 'green',
  },
}

export const ASSIGNEES: [Assignee, Assignee, Assignee, Assignee] = [
  {
    id: 'assignee-1',
    name: 'Maya Chen',
    email: 'maya.chen@acme-success.com',
    avatar: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 'assignee-2',
    name: 'Liam Patel',
    email: 'liam.patel@acme-success.com',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'assignee-3',
    name: 'Sofia Rodriguez',
    email: 'sofia.rodriguez@acme-success.com',
    avatar: 'https://i.pravatar.cc/150?img=32',
  },
  {
    id: 'assignee-4',
    name: 'Ethan Brooks',
    email: 'ethan.brooks@acme-success.com',
    avatar: 'https://i.pravatar.cc/150?img=68',
  },
]

export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  priority: 'all',
  status: 'all',
  assigneeId: 'all',
}