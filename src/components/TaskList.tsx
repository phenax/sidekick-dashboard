import {
  For,
  createSignal,
  createMemo,
  createEffect,
  onMount,
  onCleanup,
} from 'solid-js'
import { StoreSetter } from 'solid-js/store'
import { constructors, Union, match, Tag } from '../utils/adt'
import { createKeyboardHandler, createReducer } from '../utils/solid'

interface TaskItem {
  text: string
  checked?: boolean
}

interface TaskProps {
  task: TaskItem
  isHighlighted: boolean
  isEditting: boolean
  toggle: () => void
}

function Task(props: TaskProps) {
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
        {props.task.text} {props.isEditting ? '[edit]' : ''}
      </div>
    </div>
  )
}

type Action = Union<{
  ToggleCheck: number
  MoveUp: never
  MoveDown: never
}>
const Action = constructors<Action>()

interface State {
  tasks: TaskItem[]
  highlightedIndex: number
  editing: boolean
  debug: number
}

const update = match<(s: State) => State, Action>({
  ToggleCheck: (index) => (state) => ({
    ...state,
    debug: state.debug + 1,
    tasks: state.tasks.map((t, i) =>
      i === index ? { ...t, checked: !t.checked } : t
    ),
  }),
  MoveUp: () => (state) => ({
    ...state,
    highlightedIndex:
      state.highlightedIndex <= 0
        ? state.tasks.length - 1
        : state.highlightedIndex - 1,
  }),
  MoveDown: () => (state) => ({
    ...state,
    highlightedIndex:
      state.highlightedIndex >= state.tasks.length - 1
        ? 0
        : state.highlightedIndex + 1,
  }),
})

const init = {
  debug: 0,
  highlightedIndex: 1,
  editing: false,
  tasks: [{ text: 'Something' }, { text: 'Cool' }, { text: 'Now' }],
}

export default function TaskList() {
  const [state, dispatch] = createReducer<State, Action>(init, update)

  createKeyboardHandler({
    j: () => dispatch(Action.MoveDown()),
    k: () => dispatch(Action.MoveUp()),
    ' ': () => dispatch(Action.ToggleCheck(state.highlightedIndex)),
    _: () => {},
  })

  return (
    <div class="text-2xl mx-4">
      <For each={state.tasks}>
        {(task, index) => (
          <Task
            task={task}
            isHighlighted={state.highlightedIndex === index()}
            isEditting={state.highlightedIndex === index() && state.editing}
            toggle={() => dispatch(Action.ToggleCheck(index()))}
          />
        )}
      </For>
    </div>
  )
}
