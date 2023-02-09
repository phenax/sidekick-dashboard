import { createMemo } from 'solid-js'
import { match } from '../utils/adt'
import { createKeyboardHandler, createTimer, Dispatch } from '../utils/solid'
import { Action, FocussedState, TaskItem, TimerState } from './Tasks/types'
import { BREAK_DURATION } from './Tasks/update'

interface Props {
  task: TaskItem
  focussedState: FocussedState
  dispatch: Dispatch<Action>
}

export default function FocusMode(props: Props) {
  createKeyboardHandler((ev) => {
    if (ev.ctrlKey) return
    return {
      b: () => props.dispatch(Action.TakeBreak(BREAK_DURATION)),
      r: () => props.dispatch(Action.EndBreak()),
      h: () => props.dispatch(Action.GotoList()),
      Escape: () => props.dispatch(Action.GotoList()),
    }
  })

  createTimer(500, () => props.dispatch(Action.Tick()))

  const getTimeLeft = createMemo(() => {
    if (!props.focussedState.state) return null

    const [timeLeft, percentage] = match<[number, number], TimerState>({
      Focus: ({ duration, timeLapsed }) => [
        (duration - timeLapsed) / 1000,
        timeLapsed / duration,
      ],
      Break: ({ duration, timeLapsed }) => [
        timeLapsed / 1000,
        timeLapsed / duration,
      ],
      Overtime: ({ timeLapsed }) => [timeLapsed / 1000, 1],
    })(props.focussedState.state)

    const totalMinutes = timeLeft / 60
    const minutes = Math.floor(totalMinutes)
    const seconds = Math.floor((totalMinutes - minutes) * 60)

    const pad = (n: number) => n.toFixed(0).padStart(2, '0')
    return {
      text: `${pad(minutes)}:${pad(seconds)}`,
      percentage,
    }
  })

  const getHighlightClass = () =>
    !props.focussedState?.state
      ? ''
      : match<string, TimerState>({
          Focus: () => 'bg-dark-900',
          Break: (b) =>
            b.duration <= b.timeLapsed ? 'bg-red-700' : 'bg-purple',
          Overtime: () => 'bg-white text-dark-700',
        })(props.focussedState?.state)

  return (
    <div class="text-center">
      <div class="uppercase text-2xl py-2 text-gray-700">
        {props.focussedState.state?.tag}
      </div>
      <h2 class={`text-3xl bg-dark-900 mb-5 py-5 ${getHighlightClass()}`}>
        {props.task.text}
      </h2>
      <div class="flex items-center justify-center my-10">
        <div class="relative flex items-center justify-center w-96 h-96 bg-dark-900 rounded-full">
          <svg
            viewBox="0 0 100 100"
            class="w-full h-full absolute"
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="50"
              cy="50"
              r="47"
              class="stroke-purple fill-transparent stroke-2"
              stroke-dasharray="314"
              stroke-dashoffset={(getTimeLeft()?.percentage ?? 0) * -310}
              style={{ transition: 'stroke-dashoffset 0.6s linear' }}
            />
          </svg>
          <div class="text-8xl">{getTimeLeft()?.text}</div>
        </div>
      </div>
    </div>
  )
}
