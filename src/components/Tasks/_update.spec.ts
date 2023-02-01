import { runEffect } from "../../utils/solid"
import { Action, State, UI } from "./types"
import { update } from "./update"

describe('update', () => {
  it('should perform basic task list actions', () => {
    const state: State = {
      ui: UI.List(),
      tasks: [
        { text: 'Buy milk' },
        { text: 'Pour milk on self' },
        { text: 'Lick self' },
      ],
      highlightedIndex: 1,
      editing: false
    }

    const noop = () => {}

    const nextState = (a: Action, s: State = state): State =>
      runEffect(s, noop)(update(a)(s))

    const chainActions = (a: Action[]): State => a.reduce((st, a) => nextState(a, st), state)

    expect(nextState(Action.SetEditing(true))).toEqual({
      ...state,
      editing: true,
    })
    expect(nextState(Action.SetEditing(false))).toEqual({
      ...state,
      editing: false,
    })
    expect(nextState(Action.AddTask())).toEqual({
      ...state,
      highlightedIndex: 3,
      editing: true,
      tasks: [...state.tasks, { text: '' }],
    })
    expect(nextState(Action.SetContents({ index: 0, value: 'Foobar' }))).toEqual({
      ...state,
      tasks: [{ text: 'Foobar' }, ...state.tasks.slice(1)],
    })
    expect(nextState(Action.ToggleCheck(0))).toEqual({
      ...state,
      tasks: [{ text: 'Buy milk', checked: true }, ...state.tasks.slice(1)],
    })
    expect(chainActions([ Action.ToggleCheck(0), Action.ToggleCheck(0) ])).toEqual({
      ...state,
      tasks: [{ text: 'Buy milk', checked: false }, ...state.tasks.slice(1)],
    })
  })
})
