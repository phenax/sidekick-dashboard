import { createComputed, createMemo, createSignal } from 'solid-js'
import { invoke } from '@tauri-apps/api/tauri'
import Clock from './components/Clock'
import './App.css'

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
    </div>
  )
}

export default App
