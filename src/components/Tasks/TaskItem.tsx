import {
  differenceInDays,
  isBefore,
  isToday,
  isTomorrow,
  parse,
  startOfToday,
} from 'date-fns'
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

  const getPriority = createMemo(() =>
    TypedRegEx('!(?<priority>\\w+)', 'gi')
      .captures(props.task.text)
      ?.priority?.toLowerCase()
  )

  const getDisplayText = createMemo(() =>
    props.task.text.replaceAll(/:[a-z0-9-_ ]+:|@\([a-z0-9-_ ]+\)|!\w+/gi, '')
  )

  const getDeadlineInfo = createMemo(() => {
    const deadline = getDeadline()
    if (!deadline) return { text: '', style: '' }

    try {
      const deadlineDate = parse(deadline, 'd MMMM', new Date())
      const today = startOfToday()

      if (props.task.checked)
        return { text: deadline, style: 'border border-slate-800 line-through' }
      if (isToday(deadlineDate))
        return { text: 'Today', style: 'bg-red-700 text-white' }
      if (isTomorrow(deadlineDate))
        return { text: 'Tomorrow', style: 'bg-yellow-800 text-white' }
      if (isBefore(deadlineDate, today))
        return {
          text: `Overdue: ${deadline}`,
          style: 'border border-red-600 text-red-600',
        }
      const diff = differenceInDays(deadlineDate, today)
      if (diff <= 5) {
        return {
          text: `${deadline} (${diff} days left)`,
          style: 'border border-slate-800 text-yellow-700',
        }
      }
    } catch (e) {}

    return { text: deadline, style: 'border border-slate-800 text-slate-400' }
  })

  const getPriorityInfo = createMemo(() => {
    const priority = getPriority()

    if (priority === 'urgent')
      return {
        type: 'urgent',
        text: 'U',
        style: 'border-2 border-red-700 text-red-500',
      }
    if (priority === 'high')
      return {
        type: 'high',
        text: 'H',
        style: 'border-2 border-red-700 text-red-500',
      }
    if (priority === 'medium')
      return {
        type: 'medium',
        text: 'M',
        style: 'border-2 border-yellow-800 text-yellow-800',
      }

    return { type: 'low', text: priority ?? 'L', style: '' }
  })

  return (
    <div
      class={`flex items-center justify-start bg-dark-900 px-4 py-2.5 mt-2 border-l-4 relative ${
        props.isHighlighted ? 'border-purple' : 'border-transparent'
      }`}
      onClick={props.toggle}
    >
      <div
        class={`w-7 h-7 mr-4 border ${
          props.task.checked
            ? 'bg-purple border-purple'
            : getPriorityInfo().type === 'urgent'
            ? 'border-2 border-red-700'
            : 'border-gray-900'
        }`}
      ></div>
      <div class="w-full">
        <Switch
          fallback={
            <div
              class={`flex mt-1 items-center ${
                props.task.checked ? 'line-through text-slate-600' : ''
              }`}
            >
              {props.isFocused && (
                <span class="inline-block pr-3 text-sm">🔍</span>
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
              <span class="inline-block pl-1">{getDisplayText()}</span>

              <div class="absolute right-0 top-0 w-full flex justify-end">
                {getPriorityInfo().type !== 'low' && (
                  <div class={`text-sm px-1 ml-0.5 ${getPriorityInfo().style}`}>
                    {getPriorityInfo().text}
                  </div>
                )}
                {getDeadline() && (
                  <div class={`text-sm px-1 ml-0.5 ${getDeadlineInfo().style}`}>
                    {getDeadlineInfo().text}
                  </div>
                )}
              </div>
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
