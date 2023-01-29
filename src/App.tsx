import { createSignal } from 'solid-js'
import logo from './assets/logo.svg'
import { invoke } from '@tauri-apps/api/tauri'
import './App.css'

function App() {
  const [greetMsg, setGreetMsg] = createSignal('')
  const [name, setName] = createSignal('')

  async function greet() {
    setGreetMsg(await invoke('greet', { name: name() }))
  }

  return (
    <div class="container">
      <h1 class="text-3xl font-bold underline text-red">
        Hello world!
      </h1>

      <div class="row">
        <div>
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="button" onClick={() => greet()}>
            Greet
          </button>
        </div>
      </div>

      <p>{greetMsg}</p>
    </div>
  )
}

export default App
