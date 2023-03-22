import { isBefore, isSameDay, isToday, isTomorrow, parse } from 'date-fns'
import {
  createSignal,
  Switch,
  Match,
  createEffect,
  For,
  createMemo,
} from 'solid-js'
import { TypedRegEx } from 'typed-regex'
import { createKeyboardHandler } from '../../utils/solid'
import { TaskItem } from './types'

Object.assign(window as any, {
  parseDate: parse,
})

interface TaskProps {
  task: TaskItem
  isHighlighted: boolean
  isEditing: boolean
  isFocused: boolean
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

  const getDeadline = createMemo(
    () =>
      TypedRegEx('@\\((?<deadline>[a-z0-9-_ ]+)\\)', 'gi').captures(
        props.task.text
      )?.deadline
  )

  const getLabels = createMemo(() =>
    TypedRegEx(':(?<labels>[a-z0-9-_ ]+):', 'gi')
      .captureAll(props.task.text)
      .map((p) => p?.labels)
  )

  const getDisplayText = createMemo(() =>
    props.task.text.replaceAll(/:[a-z0-9-_ ]+:|@\([a-z0-9-_ ]+\)/gi, '')
  )

  const getDeadlineInfo = createMemo(() => {
    const deadline = getDeadline()
    if (!deadline) return { text: '', style: '' }

    try {
      const date = parse(deadline, 'd MMMM', new Date())

      if (isToday(date)) return { text: 'Today', style: 'bg-red-700 text-white' }
      if (isTomorrow(date)) return { text: 'Tomorrow', style: 'bg-yellow-800 text-white'}
      if (isBefore(date, new Date())) return { text: `Overdue: ${deadline}`, style: 'border border-red-600 text-red-600' }
    } catch (e) {}

    return { text: deadline, style: 'border border-slate-800 text-slate-400' }
  })

  return (
    <div
      class={`flex items-center justify-start bg-dark-900 px-4 py-2 mt-2 border-l-4 relative ${
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
        <Switch
          fallback={
            <div
              class={`flex mt-1 ${
                props.task.checked ? 'line-through text-slate-600' : ''
              }`}
            >
              {props.isFocused && (
                <span class="inline-block pr-3 text-sm align-middle">🔍</span>
              )}
              <div class="flex items-center text-sm">
                <For each={getLabels()}>
                  {(label) => (
                    <div class="px-1 mr-1 bg-slate-800 text-slate-300 font-primarybold">
                      {label}
                    </div>
                  )}
                </For>
              </div>
              <span class="inline-block pl-1"></span>
              {getDisplayText()}
              {getDeadline() && (
                <div class={`absolute right-0 top-0 px-1 text-sm ${getDeadlineInfo().style}`}>
                  {getDeadlineInfo().text}
                </div>
              )}
            </div>
          }
        >
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
