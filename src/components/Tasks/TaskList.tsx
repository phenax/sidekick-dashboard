import { For } from 'solid-js'
import { createKeyboardHandler, Dispatch } from '../../utils/solid'
import Task from './TaskItem'
import { Action, FocussedState, TaskItem } from './types'

interface Props {
  tasks: TaskItem[]
  highlightedIndex: number
  isEditing: boolean
  focussedState?: FocussedState
  dispatch: Dispatch<Action>
}

export default function TaskList(props: Props) {
  createKeyboardHandler((ev) => {
    if (props.isEditing) return

    const currentId = props.tasks[props.highlightedIndex].id

    ev.preventDefault()
    return {
      a: () => props.dispatch(Action.AddTask()),
      'C-d': () => props.dispatch(Action.DeleteTask(currentId)),
      'C-k': () => props.dispatch(Action.EndFocusMode()),
      r: () => props.dispatch(Action.LoadTasks()),
      e: () => props.dispatch(Action.SetEditing(true)),
      l: () => props.dispatch(Action.GotoFocus()),

      g: () => props.dispatch(Action.SelectFirst()),
      G: () => props.dispatch(Action.SelectLast()),
      j: () => props.dispatch(Action.SelectDown()),
      k: () => props.dispatch(Action.SelectUp()),

      J: () => props.dispatch(Action.MoveDown()),
      K: () => props.dispatch(Action.MoveUp()),
      _: () => {},
    }
  })

  return (
    <div class="text-2xl mx-4 py-2">
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
            isFocused={props.focussedState?.id === task.id}
            submit={(value) => {
              props.dispatch(
                Action.SetContents({
                  id: props.tasks[props.highlightedIndex].id,
                  value,
                })
              )
            }}
            toggle={() =>
              props.dispatch(Action.ToggleCheck(props.tasks[index()].id))
            }
            cancel={() => props.dispatch(Action.SetEditing(false))}
            openInFocusMode={() =>
              props.dispatch(Action.SwitchFocus(props.tasks[index()].id))
            }
          />
        )}
      </For>
    </div>
  )
}
