import { Routes, Route } from 'react-router-dom'
import './App.css'
import Login from './Pages/Login.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import Report from './Pages/Report.Jsx'

function App() {

  return (
    <>
      <Routes>
         <Route path="/login" element={<Login />} />
         <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<Report />} />
      </Routes>  
    </>
  )
}

export default App
