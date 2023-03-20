import { assocPath, path } from 'ramda'

export type PropKey = string | number
export type GetPath<
  P extends Readonly<PropKey[]>,
  O extends Record<PropKey, any>
> = P extends []
  ? O
  : P extends readonly [
      infer Key extends PropKey,
      ...infer Tl extends PropKey[]
    ]
  ? GetPath<Tl, O[Key]>
  : never

export const modifyPath = <
  Path extends Readonly<PropKey[]>,
  O extends Record<PropKey, any>,
  Val extends GetPath<Path, O>
>(
  p: Path,
  fn: (t: Val) => Val,
  o: O
): O => {
  const v = path(p, o) as Val
  return assocPath(p, fn(v), o)
}

export const uuid = () =>
  `${Math.random()}${Math.random()}`.slice(2, 18).padEnd(16, '0')
