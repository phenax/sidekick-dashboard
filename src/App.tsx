import './App.css'

import Clock from './components/Clock'
import Tasks from './components/Tasks'

function App() {
  // const [greetMsg, setGreetMsg] = createSignal('')
  // const [name, setName] = createSignal('')
  //
  // async function greet() {
  //   setGreetMsg(await invoke('greet', { name: name() }))
  // }

  return (
    <div>
      <Clock />
      <Tasks />
    </div>
  )
}

export default App
