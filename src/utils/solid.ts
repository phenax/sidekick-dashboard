import { compose } from 'ramda'
import { createSignal, onCleanup, onMount } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import { constructors, Enum, match, _ } from './adt'

export type Dispatch<T> = (t: T) => void

export type Effect<State, Action> = Enum<{
  Pure: State
  Effectful: { state: State; effect: () => Promise<Action> }
  Noop: _
}>
export const Effect = constructors<Effect<any, any>>()

export const runEffect =
  <S, A>(state: S, handleEffect: (e: () => Promise<A>) => void) =>
  (eff: Effect<S, A>): S =>
    match<S, Effect<S, A>>({
      Pure: (state) => state,
      Effectful: ({ state, effect }) => {
        handleEffect(effect)
        return state
      },
      Noop: () => state,
    })(eff)

export const createReducer = <State extends object, Action>(
  init: State,
  reducer: (_: Action) => (_: State) => Effect<State, Action>
): [State, Dispatch<Action>] => {
  const [state, setState] = createStore<State>(init)
  const dispatch: Dispatch<Action> = (action) => {
    const computeNextState: (s: State) => void = compose(
      setState as any,
      reconcile,
      runEffect<State, Action>(state, (eff) => eff().then(e => e && dispatch(e))),
      reducer(action)
    )

    computeNextState(state)
  }
  return [state, dispatch]
}

export const createTimer = (interval: number, action: () => void) => {
  const timer = setInterval(action, interval)
  onCleanup(() => clearInterval(timer))
}

type KeyMapFn = (ev: KeyboardEvent) => Record<string, (() => void) | undefined | null> | undefined | null

const keyboardHandler = (() => {
  const eventMapping: Set<KeyMapFn> = new Set()

  const onKeyPress = (ev: KeyboardEvent) => {
    eventMapping.forEach(pat => {
      const p = pat(ev)
      p &&
        match({ _: () => {}, ...(p as any) })({ tag: ev.key, value: undefined })
    })
  }
  window.addEventListener('keypress', onKeyPress)

  const register = (pat: KeyMapFn) => pat && eventMapping.add(pat)
  const unregister = (pat: KeyMapFn) => pat && eventMapping.delete(pat)
  return { register, unregister }
})()

export const createKeyboardHandler = (pat: KeyMapFn) => {
  onMount(() => keyboardHandler.register(pat))
  onCleanup(() => keyboardHandler.unregister(pat))
}

