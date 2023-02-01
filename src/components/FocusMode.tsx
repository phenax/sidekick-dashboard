import { match } from '../utils/adt'
import { createKeyboardHandler, createTimer, Dispatch } from '../utils/solid'
import { TaskItem } from './Tasks/TaskItem'
import { Action, TimerState } from './Tasks/types'

export interface FocussedState {
  index: number
  state?: TimerState
}

interface Props {
  task: TaskItem
  focussedState: FocussedState
  dispatch: Dispatch<Action>
}

export default function FocusMode(props: Props) {
  createKeyboardHandler(() => {
    return {
      b: () => props.dispatch(Action.TakeBreak(10)),
      r: () => props.dispatch(Action.EndBreak()),
      h: () => props.dispatch(Action.GotoList()),
      Escape: () => props.dispatch(Action.GotoList()),
    }
  })

  createTimer(500, () => props.dispatch(Action.Tick()))

  const getTimeLeft = () => {
    if (!props.focussedState.state) return ''
    const timeLeft = match<number, TimerState>({
      Focus: ({ duration, timeLapsed }) => (duration - timeLapsed) / 1000,
      Overtime: ({ timeLapsed }) => timeLapsed / 1000,
      Break: ({ timeLapsed }) => timeLapsed / 1000,
    })(props.focussedState.state)

    const totalMinutes = timeLeft / 60
    const minutes = Math.floor(totalMinutes)
    const seconds = Math.floor((totalMinutes - minutes) * 60)

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`
  }

  return (
    <div class="text-center">
      <div class="uppercase text-2xl py-2 text-gray-700">
        {props.focussedState.state?.tag}
      </div>
      <h2 class="text-3xl bg-dark-900 mb-5 py-5">{props.task.text}</h2>
      <div class="flex items-center justify-center my-10">
        <div class="flex items-center justify-center w-96 h-96 border-8 border-purple rounded-full">
          <div class="text-8xl">{getTimeLeft()}</div>
        </div>
      </div>
    </div>
  )
}
