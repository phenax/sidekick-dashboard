import { createSignal, Switch, Match } from 'solid-js'
import { createKeyboardHandler } from '../../utils/solid'

export interface TaskItem {
  text: string
  checked?: boolean
}

interface TaskProps {
  task: TaskItem
  isHighlighted: boolean
  isEditing: boolean
  toggle: () => void
  submit: (text: string) => void
}

export default function Task(props: TaskProps) {
  const [contents, setContents] = createSignal(props.task.text)

  createKeyboardHandler(() => {
    if (props.isEditing)
      return {
        Escape: () => props.submit(contents()),
        Enter: () => props.submit(contents()),
      }
  })

  return (
    <div
      class={`flex items-center bg-dark-900 px-4 py-2 mt-2 border-l-4 ${
        props.isHighlighted ? 'border-purple' : 'border-transparent'
      }`}
      onClick={props.toggle}
    >
      <div
        class={`w-7 h-7 mr-4 border ${
          props.task.checked ? 'bg-purple border-purple' : 'border-gray-900'
        }`}
      ></div>
      <div class="mt-1">
        <Switch fallback={<span>{props.task.text}</span>}>
          <Match when={props.isEditing}>
            <input
              type="text"
              autofocus
              onBlur={() => props.submit(contents())}
              value={contents()}
              onInput={(e) => setContents(e.currentTarget.value)}
              class="bg-transparent border border-gray-900"
            />
          </Match>
        </Switch>
      </div>
    </div>
  )
}
