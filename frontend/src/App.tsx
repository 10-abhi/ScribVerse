
import './App.css'
import { BrowserRouter , Route , Routes } from 'react-router-dom'
import { Signup } from './components/singup'
function App() {

  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path='/signup' element={<Signup></Signup>}></Route>
      <Route path='signin'></Route>
      <Route path='/blog:id'></Route>
     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
