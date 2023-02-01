import { modifyPath } from './helpers'

describe('modifyPath', () => {
  it('should merge objects right', () => {
    const obj = {
      user: {
        name: 'Joseph',
        age: 200,
        friends: ['Me', 'Them', 'Everyone'],
        address: {
          city: 'BoneTown',
        },
      },
    }

    expect(modifyPath(['user', 'age'] as const, (n) => n + 1, obj)).toEqual({
      ...obj,
      user: { ...obj.user, age: 201 },
    })
    expect(
      modifyPath(['user', 'friends', 2] as const, (name) => `Kill ${name}`, obj)
    ).toEqual({
      ...obj,
      user: { ...obj.user, friends: ['Me', 'Them', 'Kill Everyone'] },
    })
  })
})
