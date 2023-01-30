import { constructors, Enum, _ } from '../../utils/adt'

export type TimerState = Enum<{
  Focus: { timeLeft: number }
  Break: { timeLapsed: number }
  Overtime: { timeLapsed: number }
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
}>
export const Action = constructors<Action>()

export type UI = Enum<{
  List: {
    editing: boolean
  }
  Focus: _
}>
export const UI = constructors<UI>()

// export type Effect<State, Action> = Enum<{
//   Pure: State
//   Effectful: { state: State, effect: () => Promise<Action> }
// }>
// export const Effect = constructors<Effect<unknown, unknown>>()
