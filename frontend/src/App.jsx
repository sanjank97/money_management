import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login.jsx'
import Dashboard from './Pages/Dashboard.jsx'
function App() {

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
         <Route path="/dashboard" element={<Dashboard />} />
      </Routes>  
    </>
  )
}

export default App
