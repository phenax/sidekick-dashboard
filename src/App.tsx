import './App.css'

import Clock from './components/Clock'
import Tasks from './components/Tasks'

function App() {
  return (
    <div class="flex flex-col justify-start items-stretch">
      <Clock />
      <Tasks />
    </div>
  )
}

export default App
