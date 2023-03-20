import { runEffect } from '../../utils/solid'
import { Action, State, UI } from './types'
import { update } from './update'

vi.mock('../../utils/helpers.ts', async () => {
  const actual: any = await vi.importActual('../../utils/helpers.ts')

  return {
    ...actual,
    uuid: () => 'r@nd0m',
  }
})

describe('update', () => {
  it('should perform basic task list actions', () => {
    const state: State = {
      ui: UI.List(),
      tasks: {
        '1': { id: '1', text: 'Buy milk' },
        '2': { id: '2', text: 'Pour milk on self' },
        '3': { id: '3', text: 'Lick self' },
      },
      taskOrder: ['1', '2', '3'],
      highlightedIndex: 1,
      editing: false,
    }

    const noop = () => {}

    const nextState = (a: Action, s: State = state): State =>
      runEffect(s, noop)(update(a)(s))

    const chainActions = (a: Action[]): State =>
      a.reduce((st, a) => nextState(a, st), state)

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
      highlightedIndex: 2,
      editing: true,
      tasks: { ...state.tasks, 'r@nd0m': { id: 'r@nd0m', text: '' } },
      taskOrder: ['1', '2', 'r@nd0m', '3'],
    })
    expect(nextState(Action.SetContents({ id: '2', value: 'Foobar' }))).toEqual(
      {
        ...state,
        tasks: { ...state.tasks, '2': { id: '2', text: 'Foobar' } },
      }
    )
    expect(nextState(Action.ToggleCheck('1'))).toEqual({
      ...state,
      tasks: {
        ...state.tasks,
        '1': { id: '1', text: 'Buy milk', checked: true },
      },
    })
    expect(
      chainActions([Action.ToggleCheck('2'), Action.ToggleCheck('2')])
    ).toEqual({
      ...state,
      tasks: {
        ...state.tasks,
        '2': { id: '2', text: 'Pour milk on self', checked: false },
      },
    })

    expect(
      nextState(Action.AddTask(), { ...state, tasks: {}, taskOrder: [] })
    ).toEqual({
      ...state,
      highlightedIndex: 2,
      editing: true,
      tasks: { 'r@nd0m': { id: 'r@nd0m', text: '' } },
      taskOrder: ['r@nd0m'],
    })
  })
})
