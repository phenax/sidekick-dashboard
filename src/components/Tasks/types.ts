import { constructors, Enum, _ } from '../../utils/adt'

export type TimerState = Enum<{
  Focus: { startedAt: number; duration: number; timeLapsed: number }
  Break: { startedAt: number; duration: number; timeLapsed: number }
  Overtime: { startedAt: number; timeLapsed: number }
}>
export const TimerState = constructors<TimerState>()

export type Action = Enum<{
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
}>
export const Action = constructors<Action>()

export type UI = Enum<{
  List: {
    editing: boolean
  }
  Focus: _
}>
export const UI = constructors<UI>()

export type Effect<State, Action> = Enum<{
  Pure: State
  Effectful: { state: State; effect: () => Promise<Action> }
}>
export const Effect = constructors<Effect<any, any>>()
