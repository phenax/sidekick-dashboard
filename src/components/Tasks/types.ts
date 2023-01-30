import { constructors, Enum, _ } from '../../utils/adt'

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
  StartTimer: number
}>
export const Action = constructors<Action>()

export type UI = Enum<{
  List: {
    editing: boolean
  }
  Focus: _
}>
export const UI = constructors<UI>()