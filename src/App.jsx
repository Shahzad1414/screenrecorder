import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ScreenRecorder from './components/ScreenRecorder'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='mt-16'>
      <ScreenRecorder />
    </div>
  )
}

export default App
