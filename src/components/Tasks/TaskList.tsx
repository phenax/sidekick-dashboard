import { For } from 'solid-js'
import { createKeyboardHandler, Dispatch } from '../../utils/solid'
import Task, { TaskItem } from './TaskItem'
import { Action } from './types'

interface Props {
  tasks: TaskItem[]
  highlightedIndex: number
  editing: boolean
  dispatch: Dispatch<Action>
}

export default function TaskList(props: Props) {
  createKeyboardHandler((ev) => {
    if (props.editing) {
      if (ev.ctrlKey)
        return {
          d: () => props.dispatch(Action.SetEditing(false)),
        }

      return
    }

    return {
      e: () => props.dispatch(Action.SetEditing(true)),
      j: () => props.dispatch(Action.MoveDown()),
      k: () => props.dispatch(Action.MoveUp()),
      ' ': () => props.dispatch(Action.ToggleCheck(props.highlightedIndex)),
      _: () => {},
    }
  })

  return (
    <div class="text-2xl mx-4">
      <For each={props.tasks}>
        {(task, index) => (
          <Task
            task={task}
            isHighlighted={props.highlightedIndex === index()}
            isEditing={props.highlightedIndex === index() && props.editing}
            submit={(value) => {
              props.dispatch(
                Action.SetContents({ index: props.highlightedIndex, value })
              )
            }}
            toggle={() => props.dispatch(Action.ToggleCheck(index()))}
          />
        )}
      </For>
    </div>
  )
}
