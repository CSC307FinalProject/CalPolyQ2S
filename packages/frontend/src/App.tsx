import './App.css'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Homepage from './pages/homepage';
import Login from "./pages/login";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  )

}

export default App
