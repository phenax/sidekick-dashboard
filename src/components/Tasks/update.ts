import { invoke } from '@tauri-apps/api'
import { not, always, compose, modify, clamp, dissoc, filter } from 'ramda'
import { match } from '../../utils/adt'
import { modifyPath } from '../../utils/helpers'
import { Effect } from '../../utils/solid'
import { Action, State, TaskId, TaskItem, TimerState, UI } from './types'

export const FOCUS_DURATION = 30
export const BREAK_DURATION = 10

const uuid = () =>
  `${Math.random()}${Math.random()}`.slice(2, 18).padEnd(16, '0')

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
        duration: FOCUS_DURATION * 60 * 1000,
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

const nextIndex = (state: State) =>
  state.highlightedIndex >= state.taskOrder.length - 1
    ? 0
    : state.highlightedIndex + 1

const prevIndex = (state: State) =>
  state.highlightedIndex <= 0
    ? state.taskOrder.length - 1
    : state.highlightedIndex - 1

const swapTasks = (targetIndex: number, state: State) => {
  const tasks = [...state.taskOrder]
  const current = tasks[state.highlightedIndex]
  tasks[state.highlightedIndex] = tasks[targetIndex]
  tasks[targetIndex] = current
  return {
    ...state,
    taskOrder: tasks,
    highlightedIndex: targetIndex,
  }
}

export const update = match<(s: State) => Effect<State, Action>, Action>({
  LoadTasks: () => (state) =>
    Effect.Effectful({
      state,
      effect: () =>
        invoke('load_tasks', {})
          .then((d) => Action.LoadTasksSuccess(d as any))
          .catch((e: any) => Action.LoadTasksFailure(e.message)),
    }),
  LoadTasksSuccess: (taskItems) => (state) => {
    const tasks = taskItems.map((t) => ({ ...t, id: uuid() }))
    return Effect.Pure({
      ...state,
      tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
      taskOrder: tasks.map((t) => t.id),
    })
  },
  LoadTasksFailure: (error) => (state) =>
    Effect.Effectful({ state, effect: async () => alert(error) }),
  SyncTasks: () => (state) =>
    Effect.Effectful({
      state,
      effect: () =>
        invoke('sync_tasks', {
          tasks: state.taskOrder.map((tid) => state.tasks[tid]),
        }),
    }),

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
    Effect.Pure({ ...state, highlightedIndex: prevIndex(state) }),
  SelectDown: () => (state) =>
    Effect.Pure({ ...state, highlightedIndex: nextIndex(state) }),
  SelectFirst: () => (state) => Effect.Pure({ ...state, highlightedIndex: 0 }),
  SelectLast: () => (state) =>
    Effect.Pure({ ...state, highlightedIndex: state.taskOrder.length - 1 }),

  MoveUp: () => (state) => Effect.Pure(swapTasks(prevIndex(state), state)),
  MoveDown: () => (state) => Effect.Pure(swapTasks(nextIndex(state), state)),

  AddTask: () => (state) =>
    Effect.Pure(
      match<State, UI>({
        List: (_) =>
          compose(
            (s: State) => modifyPath(['editing'] as const, always(true), s),
            (s: State) =>
              modifyPath(
                ['highlightedIndex'] as const,
                always(s.taskOrder.length - 1),
                s
              ),
            (s: State) => {
              const tid = uuid()
              return compose(
                modify('tasks', (t: Record<TaskId, TaskItem>) => ({
                  ...t,
                  [tid]: { id: tid, text: '' },
                })),
                modify('taskOrder', (t: TaskId[]) => [...t, tid])
              )(s) as State
            }
          )(state),
        _: () => state,
      })(state.ui)
    ),

  DeleteTask: (taskId) => (state) =>
    Effect.Pure(
      compose(
        modify('highlightedIndex', clamp(0, state.taskOrder.length - 2)),
        modify('tasks', dissoc(taskId) as any) as (s: State) => State,
        modify('taskOrder', filter((t) => t !== taskId) as any) as (
          s: State
        ) => State
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
    ({ id, value }) =>
    (state) =>
      Effect.Pure(
        compose(
          (s: State) =>
            modifyPath(['tasks', id, 'text'] as const, always(value), s),
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

  Refresh: () => (state) =>
    Effect.Effectful({
      state,
      effect: async () => location.reload(),
    }),
})
