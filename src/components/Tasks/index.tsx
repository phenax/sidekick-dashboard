import { not, always, compose, modify } from 'ramda'
import { Switch, Match } from 'solid-js'
import { match, _ } from '../../utils/adt'
import { modifyPath } from '../../utils/helpers'
import { createReducer } from '../../utils/solid'
import FocusMode, { FocussedState } from '../FocusMode'
import { TaskItem } from './TaskItem'
import TaskList from './TaskList'
import { Action, TimerState, UI } from './types'

interface State {
  ui: UI
  focussedState?: FocussedState
  tasks: TaskItem[]
  highlightedIndex: number
}

const init: State = {
  ui: UI.Focus(),
  focussedState: {
    index: 1,
    state: TimerState.Focus({
      startedAt: Date.now(),
      duration: 5 * 1000,
      timeLapsed: 0,
    }),
  },
  tasks: [
    { text: 'Something' },
    { text: 'This task is hip n fresh' },
    { text: 'Now' },
  ],
  highlightedIndex: 0,
}

const gotoFocus = (s: State) =>
  s.focussedState ? modifyPath(['ui'] as const, always(UI.Focus()), s) : s

const nextTimerState = (state: State) => {
  return !state.focussedState?.state
    ? state
    : match<State, TimerState>({
        Focus: (p) =>
          modifyPath(
            ['focussedState', 'state'] as const,
            () =>
              Date.now() - p.startedAt >= p.duration
                ? TimerState.Overtime({ startedAt: Date.now(), timeLapsed: 0 })
                : TimerState.Focus({
                    ...p,
                    timeLapsed: Date.now() - p.startedAt,
                  }),
            state
          ),
        _: () =>
          modifyPath(
            ['focussedState', 'state', 'value', 'timeLapsed'] as const,
            (t: number) => (t ?? 0) + 1,
            state
          ),
      })(state.focussedState.state)
}

const startFocus = (state: State) =>
  modifyPath(
    ['focussedState', 'state'] as const,
    always(
      TimerState.Focus({
        startedAt: Date.now(),
        duration: 30 * 60 * 1000,
        timeLapsed: 0,
      })
    ),
    state
  )

const startBreak = (state: State, minutes: number) =>
  modifyPath(
    ['focussedState', 'state'] as const,
    always(
      TimerState.Break({
        startedAt: Date.now(),
        duration: minutes * 60 * 1000,
        timeLapsed: 0,
      })
    ),
    state
  )

const update = match<(s: State) => State, Action>({
  GotoList: () => (state) => ({ ...state, ui: UI.List({ editing: false }) }),
  GotoFocus: () => gotoFocus,
  SwitchFocus: (index) =>
    compose(
      gotoFocus,
      (s: State) =>
        modifyPath(['focussedState', 'index'] as const, always(index), s),
      startFocus
    ),

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

  Tick: () => (state) =>
    match<State, UI>({
      Focus: () => nextTimerState(state),
      _: () => state,
    })(state.ui),

  TakeBreak: (minutes) => (state) =>
    match<State, UI>({
      Focus: () => startBreak(state, minutes),
      _: () => state,
    })(state.ui),

  EndBreak: () => startFocus,
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
