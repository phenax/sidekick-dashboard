import { Switch, Match, onMount, createEffect } from 'solid-js'
import { createKeyboardHandler, createReducer } from '../../utils/solid'
import FocusMode from '../FocusMode'
import TaskList from './TaskList'
import { Action, State, UI } from './types'
import { update } from './update'

const init: State = {
  ui: UI.List(),
  tasks: {},
  taskOrder: [],
  highlightedIndex: 0,
  editing: false,
}

export default function Tasks() {
  const [state, dispatch] = createReducer(init, update)

  createKeyboardHandler((_) => {
    return {
      'C-r': () => dispatch(Action.Refresh()),
    }
  })

  onMount(() => {
    dispatch(Action.LoadTasks())
  })

  createEffect(() => {
    dispatch(Action.SyncTasks())
  }, state.tasks)

  return (
    <div>
      <Switch>
        <Match when={state.ui.tag === 'List'}>
          <TaskList
            dispatch={dispatch}
            highlightedIndex={state.highlightedIndex}
            tasks={state.taskOrder.map((tid) => state.tasks[tid])}
            isEditing={state.editing}
          />
        </Match>
        <Match when={state.ui.tag === 'Focus' && state.focussedState}>
          <FocusMode
            dispatch={dispatch}
            focussedState={state.focussedState as any}
            task={state.tasks[state.focussedState?.index ?? 0]}
          />
        </Match>
      </Switch>
    </div>
  )
}
