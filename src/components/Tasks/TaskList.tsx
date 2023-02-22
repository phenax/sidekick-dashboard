import { For } from 'solid-js'
import { createKeyboardHandler, Dispatch } from '../../utils/solid'
import Task from './TaskItem'
import { Action, TaskItem } from './types'

interface Props {
  tasks: TaskItem[]
  highlightedIndex: number
  isEditing: boolean
  dispatch: Dispatch<Action>
}

export default function TaskList(props: Props) {
  createKeyboardHandler((ev) => {
    if (props.isEditing) return
    if (ev.ctrlKey) return

    const currentId = props.tasks[props.highlightedIndex].id

    ev.preventDefault()
    return {
      a: () => props.dispatch(Action.AddTask()),
      r: () => props.dispatch(Action.LoadTasks()),
      d: () => props.dispatch(Action.DeleteTask(currentId)),
      e: () => props.dispatch(Action.SetEditing(true)),
      l: () => props.dispatch(Action.GotoFocus()),

      j: () => props.dispatch(Action.SelectDown()),
      k: () => props.dispatch(Action.SelectUp()),

      J: () => props.dispatch(Action.MoveDown()),
      K: () => props.dispatch(Action.MoveUp()),
      _: () => {},
    }
  })

  return (
    <div class="text-2xl mx-4">
      <For
        each={props.tasks}
        fallback={() => (
          <div class="text-2xl text-center py-16 w-full text-gray-500">
            Are you seriously free right now?
          </div>
        )}
      >
        {(task, index) => (
          <Task
            task={task}
            isHighlighted={props.highlightedIndex === index()}
            isEditing={props.highlightedIndex === index() && props.isEditing}
            submit={(value) => {
              props.dispatch(
                Action.SetContents({ id: props.tasks[props.highlightedIndex].id, value })
              )
            }}
            toggle={() => props.dispatch(Action.ToggleCheck(props.tasks[index()].id))}
            cancel={() => props.dispatch(Action.SetEditing(false))}
            openInFocusMode={() => props.dispatch(Action.SwitchFocus(props.tasks[index()].id))}
          />
        )}
      </For>
    </div>
  )
}
