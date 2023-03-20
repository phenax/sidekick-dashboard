import { constructors, Enum, _ } from '../../utils/adt'

export interface TaskItem {
  id: TaskId
  text: string
  checked?: boolean
}

export interface FocussedState {
  index: number
  state?: TimerState
}

export type TaskId = string

export interface State {
  ui: UI
  focussedState?: FocussedState
  tasks: Record<TaskId, TaskItem>
  taskOrder: TaskId[]
  highlightedIndex: number
  editing: boolean
}

export type TimerState = Enum<{
  Focus: { startedAt: number; duration: number; timeLapsed: number }
  Break: { startedAt: number; duration: number; timeLapsed: number }
  Overtime: { startedAt: number; timeLapsed: number }
}>
export const TimerState = constructors<TimerState>()

export type Action = Enum<{
  AddTask: _
  DeleteTask: TaskId
  ToggleCheck: TaskId
  SelectUp: _
  SelectDown: _
  SelectFirst: _
  SelectLast: _
  MoveUp: _
  MoveDown: _
  SetEditing: boolean
  SetContents: { id: TaskId; value: string }
  GotoFocus: _
  GotoList: _
  SwitchFocus: TaskId
  Tick: _
  TakeBreak: number // minutes
  EndBreak: _
  Refresh: _
  LoadTasks: _
  LoadTasksSuccess: TaskItem[]
  LoadTasksFailure: string
  SyncTasks: _
  EndFocusMode: _
}>
export const Action = constructors<Action>()

export type UI = Enum<{
  List: _
  Focus: _
}>
export const UI = constructors<UI>()
