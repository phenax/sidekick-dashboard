import { not, always, compose } from 'ramda'
import { Switch, Match } from 'solid-js'
import { match, _ } from '../../utils/adt'
import { modifyPath } from '../../utils/helpers'
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
          : modifyPath(['tasks', index, 'checked'] as const, not, state),
      _: () => state,
    })(state.ui),

  SetEditing: (enable) => (state) =>
    match<State, UI>({
      List: (_) =>
        modifyPath(['ui', 'editing'] as const, always(enable), state),
      _: () => state,
    })(state.ui),

  SetContents:
    ({ index, value }) =>
    (state) =>
      match<State, UI>({
        List: (_) =>
          compose(
            (s: State) =>
              modifyPath(['tasks', index, 'text'] as const, always(value), s),
            (s: State) =>
              modifyPath(['ui', 'editing'] as const, always(false), s)
          )(state),
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
