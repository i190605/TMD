import { Search, List, Plus, CircleHelp } from 'lucide-react'
import { Button } from './Button'
import { Modal } from './Modal'

export interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNewTask: () => void
  onSearch: () => void
  onTaskList: () => void
  onShortcuts: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onNewTask,
  onSearch,
  onTaskList,
  onShortcuts,
}: CommandPaletteProps) {
  const run = (action: () => void): void => {
    onClose()
    action()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command palette" size="sm">
      <div className="grid gap-2">
        <Button variant="ghost" className="justify-start" icon={<Plus className="size-4" />} onClick={() => run(onNewTask)}>
          New task
        </Button>
        <Button variant="ghost" className="justify-start" icon={<Search className="size-4" />} onClick={() => run(onSearch)}>
          Focus search
        </Button>
        <Button variant="ghost" className="justify-start" icon={<List className="size-4" />} onClick={() => run(onTaskList)}>
          Go to task list
        </Button>
        <Button variant="ghost" className="justify-start" icon={<CircleHelp className="size-4" />} onClick={() => run(onShortcuts)}>
          Keyboard shortcuts
        </Button>
      </div>
    </Modal>
  )
}