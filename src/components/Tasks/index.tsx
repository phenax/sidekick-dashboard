import { not, always, compose, modify } from 'ramda'
import { Switch, Match } from 'solid-js'
import { match } from '../../utils/adt'
import { modifyPath } from '../../utils/helpers'
import { createReducer } from '../../utils/solid'
import FocusMode, { FocussedState } from '../FocusMode'
import { TaskItem } from './TaskItem'
import TaskList from './TaskList'
import { Action, Effect, TimerState, UI } from './types'

interface State {
  ui: UI
  focussedState?: FocussedState
  tasks: TaskItem[]
  highlightedIndex: number
  editing: boolean
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
  editing: false
}

const gotoFocus = (s: State) =>
  s.focussedState ? modifyPath(['ui'] as const, always(UI.Focus()), s) : s

const nextTimerState = (state: State) => {
  const updateTS = (fn: (_: TimerState) => TimerState): State =>
    modifyPath(['focussedState', 'state'] as const, fn, state)

  return !state.focussedState?.state
    ? state
    : match<State, TimerState>({
        Focus: (p) =>
          updateTS(() =>
            Date.now() - p.startedAt >= p.duration
              ? TimerState.Overtime({ startedAt: Date.now(), timeLapsed: 0 })
              : TimerState.Focus({
                  ...p,
                  timeLapsed: Date.now() - p.startedAt,
                })
          ),
        Overtime: (p) =>
          updateTS(() =>
            TimerState.Overtime({ ...p, timeLapsed: Date.now() - p.startedAt })
          ),
        Break: (p) =>
          updateTS(() =>
            TimerState.Break({ ...p, timeLapsed: Date.now() - p.startedAt })
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

const update = match<(s: State) => Effect<State, Action>, Action>({
  GotoList: () => (state) =>
    state.editing ? Effect.Noop() : Effect.Pure({ ...state, ui: UI.List() }),
  GotoFocus: () => (state: State) => state.editing ? Effect.Noop() : Effect.Pure(gotoFocus(state)),
  SwitchFocus: (index) => (state: State) =>
    state.editing ? Effect.Noop() :
    Effect.Pure(
      compose(
        gotoFocus,
        (s: State) =>
          modifyPath(['focussedState', 'index'] as const, always(index), s),
        startFocus
      )(state)
    ),

  SelectUp: () => (state) =>
    Effect.Pure({
      ...state,
      highlightedIndex:
        state.highlightedIndex <= 0
          ? state.tasks.length - 1
          : state.highlightedIndex - 1,
    }),

  SelectDown: () => (state) =>
    Effect.Pure({
      ...state,
      highlightedIndex:
        state.highlightedIndex >= state.tasks.length - 1
          ? 0
          : state.highlightedIndex + 1,
    }),

  AddTask: () => (state) => Effect.Pure(
    match<State, UI>({
      List: (_) =>
        compose(
          (s: State) => modifyPath(['editing'] as const, always(true), s),
          (s: State) => modifyPath(['highlightedIndex'] as const, always(s.tasks.length - 1), s),
          (s: State) => modify('tasks', t => [...t, { text: '<>' }], s),
        )(state),
      _: () => state,
    })(state.ui)
  ),

  ToggleCheck: (index) => (state) =>
    state.editing ? Effect.Noop() :
    Effect.Pure(modifyPath(['tasks', index, 'checked'] as const, not, state)),

  SetEditing: (enable) => (state) =>
    Effect.Pure(modifyPath(['editing'] as const, always(enable), state)),

  SetContents:
    ({ index, value }) =>
    (state) =>
      Effect.Pure(
        compose(
          (s: State) =>
            modifyPath(['tasks', index, 'text'] as const, always(value), s),
          (s: State) =>
            modifyPath(['editing'] as const, always(false), s)
        )(state),
      ),

  Tick: () => (state) =>
    Effect.Pure(
      match<State, UI>({
        Focus: () => nextTimerState(state),
        _: () => state,
      })(state.ui)
    ),

  TakeBreak: (minutes) => (state) =>
    Effect.Pure(
      match<State, UI>({
        Focus: () => startBreak(state, minutes),
        _: () => state,
      })(state.ui)
    ),

  EndBreak: () => (state: State) => Effect.Pure(startFocus(state)),
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
