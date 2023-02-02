import { not, always, compose, modify, remove, clamp } from 'ramda'
import { match } from '../../utils/adt'
import { modifyPath } from '../../utils/helpers'
import { Effect } from '../../utils/solid'
import { Action, State, TimerState, UI } from './types'

const gotoFocus = (s: State) =>
  s.focussedState ? modifyPath(['ui'] as const, always(UI.Focus()), s) : s

const nextTimerState = (state: State) => {
  const updateTS = (fn: (_: TimerState) => TimerState): State =>
    modifyPath(['focussedState', 'state'] as const, fn, state)

  if (!state.focussedState?.state) return state

  return match<State, TimerState>({
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

export const update = match<(s: State) => Effect<State, Action>, Action>({
  GotoList: () => (state) =>
    state.editing ? Effect.Noop() : Effect.Pure({ ...state, ui: UI.List() }),
  GotoFocus: () => (state: State) =>
    state.editing ? Effect.Noop() : Effect.Pure(gotoFocus(state)),
  SwitchFocus: (index) => (state: State) =>
    state.editing
      ? Effect.Noop()
      : Effect.Pure(
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

  AddTask: () => (state) =>
    Effect.Pure(
      match<State, UI>({
        List: (_) =>
          compose(
            (s: State) => modifyPath(['editing'] as const, always(true), s),
            (s: State) =>
              modifyPath(
                ['highlightedIndex'] as const,
                always(s.tasks.length - 1),
                s
              ),
            (s: State) => modify('tasks', (t) => [...t, { text: '' }], s)
          )(state),
        _: () => state,
      })(state.ui)
    ),

  DeleteTask: index => state => Effect.Pure(
    compose(
      modify('highlightedIndex', clamp(0, state.tasks.length - 2)),
      modify('tasks', remove(index, 1)),
    )(state)
  ),

  ToggleCheck: (index) => (state) =>
    state.editing
      ? Effect.Noop()
      : Effect.Pure(
          modifyPath(['tasks', index, 'checked'] as const, not, state)
        ),

  SetEditing: (enable) => (state) =>
    Effect.Pure(modifyPath(['editing'] as const, always(enable), state)),

  SetContents:
    ({ index, value }) =>
    (state) =>
      Effect.Pure(
        compose(
          (s: State) =>
            modifyPath(['tasks', index, 'text'] as const, always(value), s),
          (s: State) => modifyPath(['editing'] as const, always(false), s)
        )(state)
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

  Refresh: () => (state) => Effect.Effectful({
    state,
    effect: async () => location.reload(),
  })
})
