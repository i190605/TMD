import { Modal } from './Modal'

export interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

const shortcuts = [
  ['N', 'New task'],
  ['/', 'Search'],
  ['Cmd/Ctrl + K', 'Command palette'],
  ['Esc', 'Close'],
  ['↑ / ↓', 'Navigate task list'],
  ['Enter', 'Open selected task'],
  ['Space', 'Toggle row selection'],
  ['Shift + click', 'Select a row range (table)'],
] as const

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard shortcuts" size="sm">
      <dl className="divide-y divide-slate-200 dark:divide-slate-700">
        {shortcuts.map(([keys, description]) => (
          <div
            className="flex items-center justify-between gap-6 py-3 first:pt-0 last:pb-0"
            key={keys}
          >
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              {description}
            </dt>
            <dd>
              <kbd className="rounded-md border border-slate-300 bg-slate-50 px-2 py-1 font-mono text-xs font-semibold text-slate-800 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                {keys}
              </kbd>
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  )
}