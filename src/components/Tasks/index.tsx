import { Switch, Match } from 'solid-js'
import { match, _ } from '../../utils/adt'
import { createReducer } from '../../utils/solid'
import { TaskItem } from './TaskItem'
import TaskList from './TaskList'
import { Action, UI } from './types'

interface State {
  ui: UI
  tasks: TaskItem[]
  highlightedIndex: number
}

const init: State = {
  ui: UI.List({ editing: false }),
  tasks: [{ text: 'Something' }, { text: 'Cool' }, { text: 'Now' }],
  highlightedIndex: 0,
}

const updateTask = ({
  state,
  where,
  fn,
}: {
  state: State
  where: (t: TaskItem, i: number) => boolean
  fn: (t: TaskItem, i: number) => TaskItem
}) => ({
  ...state,
  tasks: state.tasks.map((t, i) => (where(t, i) ? fn(t, i) : t)),
})

const update = match<(s: State) => State, Action>({
  SetUI: (ui) => (state) => ({ ...state, ui }),

  SelectUp: () => (state) => ({
    ...state,
    highlightedIndex:
      state.highlightedIndex <= 0
        ? state.tasks.length - 1
        : state.highlightedIndex - 1,
  }),
  SelectDown: () => (state) => ({
    ...state,
    highlightedIndex:
      state.highlightedIndex >= state.tasks.length - 1
        ? 0
        : state.highlightedIndex + 1,
  }),

  ToggleCheck: (index) => (state) =>
    match<State, UI>({
      List: (p) =>
        p.editing
          ? state
          : updateTask({
              state,
              where: (_, i) => i === index,
              fn: (t) => ({ ...t, checked: !t.checked }),
            }),
      _: () => state,
    })(state.ui),

  SetEditing: (enable) => (state) =>
    match<State, UI>({
      List: (p) => ({ ...state, ui: UI.List({ ...p, editing: enable }) }),
      _: () => state,
    })(state.ui),

  SetContents:
    ({ index, value }) =>
    (state) =>
      match<State, UI>({
        List: (p) => ({
          ...updateTask({
            state,
            where: (_, i) => i === index,
            fn: (t) => ({ ...t, text: value }),
          }),
          ui: UI.List({ ...p, editing: false }),
        }),
        _: () => state,
      })(state.ui),
})

export default function Tasks() {
  const [state, dispatch] = createReducer(init, update)

  return (
    <div>
      <Switch>
        <Match when={state.ui.tag === 'List'}>
          <TaskList
            dispatch={dispatch}
            highlightedIndex={state.highlightedIndex}
            tasks={state.tasks}
            isEditing={state.ui.tag === 'List' && state.ui.value.editing}
          />
        </Match>
        <Match when={state.ui.tag === 'Focus'}>
          <div>{state.ui.tag === 'Focus' && state.ui.value.index}</div>
        </Match>
      </Switch>
    </div>
  )
}
