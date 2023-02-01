import { createSignal, Switch, Match, createEffect } from 'solid-js'
import { createKeyboardHandler } from '../../utils/solid'
import { TaskItem } from './types'

interface TaskProps {
  task: TaskItem
  isHighlighted: boolean
  isEditing: boolean
  toggle: () => void
  submit: (text: string) => void
  cancel: () => void
  openInFocusMode: () => void
}

export default function Task(props: TaskProps) {
  const [contents, setContents] = createSignal(props.task.text)
  let $inputRef: HTMLInputElement

  createKeyboardHandler(() => {
    if (props.isEditing) {
      return {
        Enter: () => props.submit(contents()),
        Escape: () => {
          setContents(props.task.text)
          props.cancel()
        },
      }
    }

    if (props.isHighlighted) {
      return {
        f: () => props.openInFocusMode(),
        ' ': () => props.toggle(),
      }
    }
  })

  // Force focus on input when editing
  createEffect(() => {
    if (props.isEditing) {
      $inputRef?.focus()
    }
  })

  return (
    <div
      class={`flex items-center justify-start bg-dark-900 px-4 py-2 mt-2 border-l-4 ${
        props.isHighlighted ? 'border-purple' : 'border-transparent'
      }`}
      onClick={props.toggle}
    >
      <div
        class={`w-7 h-7 mr-4 border ${
          props.task.checked ? 'bg-purple border-purple' : 'border-gray-900'
        }`}
      ></div>
      <div class="w-full">
        <Switch fallback={<div class="mt-1">{props.task.text}</div>}>
          <Match when={props.isEditing}>
            <input
              type="text"
              ref={(e) => ($inputRef = e)}
              autofocus
              value={contents()}
              onInput={(e) => setContents(e.currentTarget.value)}
              class="bg-transparent border border-gray-700 block w-full px-3 pt-1 pb-0.5"
            />
          </Match>
        </Switch>
      </div>
    </div>
  )
}
