import { constructors, Enum, _ } from '../../utils/adt'

export interface TaskItem {
  text: string
  checked?: boolean
}

export interface FocussedState {
  index: number
  state?: TimerState
}

export interface State {
  ui: UI
  focussedState?: FocussedState
  tasks: TaskItem[]
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
  DeleteTask: number
  ToggleCheck: number
  SelectUp: _
  SelectDown: _
  SetEditing: boolean
  SetContents: { index: number; value: string }
  GotoFocus: _
  GotoList: _
  SwitchFocus: number
  Tick: _
  TakeBreak: number // minutes
  EndBreak: _
  Refresh: _
}>
export const Action = constructors<Action>()

export type UI = Enum<{
  List: _
  Focus: _
}>
export const UI = constructors<UI>()
