import { onCleanup } from 'solid-js'
import { createKeyboardHandler, Dispatch } from '../utils/solid'
import { TaskItem } from './Tasks/TaskItem'
import { Action } from './Tasks/types'

export interface FocussedState {
  index: number
  timeLeft?: number
  running?: false
}

interface Props {
  task: TaskItem
  focussedState: FocussedState
  dispatch: Dispatch<Action>
}

export default function FocusMode(props: Props) {
  createKeyboardHandler(() => {
    return {
      h: () => props.dispatch(Action.GotoList()),
      Escape: () => props.dispatch(Action.GotoList()),
    }
  })

  const timer = setInterval(() => {
    props.dispatch(Action.Tick())
  }, 1000)
  onCleanup(() => clearInterval(timer))

  const getTimeLeft = () => {
    const timeLeft = props.focussedState.timeLeft ?? 0
    const totalMinutes = timeLeft / 60
    const minutes = Math.floor(totalMinutes)
    const seconds = Math.floor((totalMinutes - minutes) * 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div>
      <h2 class="text-3xl bg-dark-900 my-5 py-5 text-center">
        {props.task.text}
      </h2>
      <div class="flex items-center justify-center my-10">
        <div
          onClick={() => props.dispatch(Action.StartTimer(3 * 60 + 13))}
          class="flex items-center justify-center w-96 h-96 border-8 border-purple rounded-full"
        >
          <div class="text-8xl">{getTimeLeft()}</div>
        </div>
      </div>
    </div>
  )
}
