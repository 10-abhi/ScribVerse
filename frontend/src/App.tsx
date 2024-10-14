
import './App.css'
import { BrowserRouter , Route , Routes } from 'react-router-dom'
import { Signup } from './pages/singup'
import { Signin } from './pages/signin'
function App() {

  return (
    <>
     <BrowserRouter>
     <Routes>
      <Route path='/signup' element={<Signup></Signup>}></Route>
      <Route path='/signin' element={<Signin></Signin>}></Route>
      <Route path='/blog'></Route>
      <Route path='/blog:id'></Route>
     </Routes>
     </BrowserRouter>
    </>
  )
}

export default App
