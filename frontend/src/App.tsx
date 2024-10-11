
import './App.css'
import { BrowserRouter , Route , Routes } from 'react-router-dom'

function App() {

  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path='/signup'></Route>
      <Route path='signin'></Route>
      <Route path='/blog:id'></Route>
     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
