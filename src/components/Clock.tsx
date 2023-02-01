import { createMemo, createSignal } from 'solid-js'
import { createTimer } from '../utils/solid'

export default function Clock() {
  const [time, setTime] = createSignal(new Date())

  createTimer(500, () => setTime(new Date()))

  const formattedTime = createMemo(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
    return format.format(time()).replace(/am|pm$/gi, '')
  })

  const formattedDate = createMemo(() => {
    const format = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
    return format.format(time())
  })

  return (
    <div
      class="text-center bg-dark-900 font-primarybold"
      style={{ padding: '4rem 0' }}
    >
      <h1 class="text-9xl">{formattedTime}</h1>
      <div class="text-3xl">{formattedDate}</div>
    </div>
  )
}
