import { constructors, Enum, _ } from '../../utils/adt'

export type Action = Enum<{
  SetUI: UI
  ToggleCheck: number
  SelectUp: _
  SelectDown: _
  SetEditing: boolean
  SetContents: { index: number; value: string }
}>
export const Action = constructors<Action>()

export type UI = Enum<{
  List: {
    editing: boolean
  }
  Focus: {
    index: number
  }
}>
export const UI = constructors<UI>()
