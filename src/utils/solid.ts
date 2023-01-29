import { onCleanup, onMount } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import { match } from "./adt"

export type Dispatch<T> = (t: T) => void

export const createReducer = <State extends object, Action>(init: State, reducer: (_: Action) => (_: State) => State): [State, Dispatch<Action>] => {
  const [state, setState] = createStore<State>(init)
  const dispatch: Dispatch<Action> = (action) => setState(reconcile(reducer(action)(state)))
  return [state, dispatch]
}

export const createKeyboardHandler = (pat: Record<string, () => void>) => {
  const onKeyPress = (ev: KeyboardEvent) =>
    match(pat)({ tag: ev.key, value: undefined })
  onMount(() => window.addEventListener('keypress', onKeyPress))
  onCleanup(() => window.addEventListener('keypress', onKeyPress))
}

