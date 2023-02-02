import { Switch, Match } from 'solid-js'
import { createKeyboardHandler, createReducer } from '../../utils/solid'
import FocusMode from '../FocusMode'
import TaskList from './TaskList'
import { Action, State, UI } from './types'
import { update } from './update'

const init: State = {
  ui: UI.List(),
  // focussedState: {
  //   index: 1,
  //   state: TimerState.Focus({
  //     startedAt: Date.now(),
  //     duration: 5 * 1000,
  //     timeLapsed: 0,
  //   }),
  // },
  tasks: [
    { text: 'Something' },
    { text: 'This task is hip n fresh' },
    { text: 'Now' },
  ],
  highlightedIndex: 0,
  editing: false,
}

export default function Tasks() {
  const [state, dispatch] = createReducer(init, update)

  createKeyboardHandler((ev) => {
    if (ev.ctrlKey) {
      return {
        r: () => dispatch(Action.Refresh()),
      }
    }
  })

  return (
    <div>
      <Switch>
        <Match when={state.ui.tag === 'List'}>
          <TaskList
            dispatch={dispatch}
            highlightedIndex={state.highlightedIndex}
            tasks={state.tasks}
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
