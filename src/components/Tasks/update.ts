import { invoke } from '@tauri-apps/api'
import {
  not,
  always,
  compose,
  modify,
  clamp,
  dissoc,
  filter,
  insert,
} from 'ramda'
import { match } from '../../utils/adt'
import { modifyPath, uuid } from '../../utils/helpers'
import { Effect } from '../../utils/solid'
import { Action, State, TimerState, UI } from './types'

export const FOCUS_DURATION = 30
export const BREAK_DURATION = 10

const onUi = (
  t: UI['tag'],
  state: State,
  fn: (s: State) => Effect<State, Action>
) => (t === state.ui.tag ? fn(state) : Effect.Pure(state))

const gotoFocus = (s: State) =>
  s.focussedState ? modify('ui', always(UI.Focus()), s) : s

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
  clamp(0, state.taskOrder.length - 1, state.highlightedIndex + 1)

const prevIndex = (state: State) =>
  clamp(0, state.taskOrder.length - 1, state.highlightedIndex - 1)

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
  SwitchFocus: (id) => (state: State) =>
    state.editing
      ? Effect.Noop()
      : Effect.Pure(
          compose(
            gotoFocus,
            (s: State) =>
              modifyPath(['focussedState', 'id'] as const, always(id), s),
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
    onUi('List', state, (s) => {
      const tid = uuid()
      const idx = s.highlightedIndex + 1
      return Effect.Pure({
        ...s,
        editing: true,
        highlightedIndex: idx,
        tasks: { ...s.tasks, [tid]: { id: tid, text: '' } },
        taskOrder: insert(idx, tid, s.taskOrder),
      })
    }),

  DeleteTask: (taskId) => (state) =>
    onUi('List', state, (s) =>
      Effect.Pure({
        ...s,
        highlightedIndex: clamp(
          0,
          state.taskOrder.length - 2,
          s.highlightedIndex
        ),
        focussedState:
          s.focussedState?.id === taskId ? undefined : s.focussedState,
        tasks: dissoc(taskId, s.tasks),
        taskOrder: filter((t) => t !== taskId, s.taskOrder),
      })
    ),

  ToggleCheck: (index) => (state) =>
    state.editing
      ? Effect.Noop()
      : Effect.Pure(
          modifyPath(['tasks', index, 'checked'] as const, not, state)
        ),

  SetEditing: (editing) => (state) => Effect.Pure({ ...state, editing }),

  SetContents:
    ({ id, value }) =>
    (state) =>
      Effect.Pure({
        ...modifyPath(['tasks', id, 'text'] as const, always(value), state),
        editing: false,
      }),

  Tick: () => (state) =>
    onUi('Focus', state, (s) => Effect.Pure(nextTimerState(s))),

  TakeBreak: (minutes) => (state) =>
    onUi('Focus', state, (s) => Effect.Pure(startBreak(s, minutes))),

  EndBreak: () => (state: State) => Effect.Pure(startFocus(state)),

  EndFocusMode: () => (state: State) =>
    onUi('Focus', state, (s) =>
      Effect.Pure({
        ...s,
        focussedState: undefined,
        ui: UI.List(),
      })
    ),

  Refresh: () => (state) =>
    Effect.Effectful({
      state,
      effect: async () => location.reload(),
    }),
})
