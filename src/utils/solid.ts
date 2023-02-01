import { compose } from 'ramda'
import { onCleanup, onMount } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { constructors, Enum, match, _ } from './adt'

export type Dispatch<T> = (t: T) => void

export type Effect<State, Action> = Enum<{
  Pure: State
  Effectful: { state: State; effect: () => Promise<Action> }
  Noop: _
}>
export const Effect = constructors<Effect<any, any>>()

export const createReducer = <State extends object, Action>(
  init: State,
  reducer: (_: Action) => (_: State) => Effect<State, Action>
): [State, Dispatch<Action>] => {
  const [state, setState] = createStore<State>(init)
  const dispatch: Dispatch<Action> = (action) => {
    const computeNextState = compose(
      match<void, Effect<State, Action>>({
        Pure: (state) => setState(reconcile(state)),
        Effectful: ({ state, effect }) => {
          effect().then(dispatch)
          setState(reconcile(state))
        },
        Noop: () => {},
      }),
      reducer(action)
    )

    computeNextState(state)
  }
  return [state, dispatch]
}

export const createKeyboardHandler = (
  pat: (
    ev: KeyboardEvent
  ) => Record<string, (() => void) | undefined | null> | undefined | null
) => {
  const onKeyPress = (ev: KeyboardEvent) => {
    const p = pat(ev)
    p &&
      match({ _: () => {}, ...(p as any) })({ tag: ev.key, value: undefined })
  }
  onMount(() => window.addEventListener('keypress', onKeyPress))
  onCleanup(() => window.addEventListener('keypress', onKeyPress))
}

export const createTimer = (interval: number, action: () => void) => {
  const timer = setInterval(action, interval)
  onCleanup(() => clearInterval(timer))
}
