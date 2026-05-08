import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './pages/homepage';
import Login from "./pages/login";
import Register from "./pages/register";
import ClassSelector from "./pages/class-selector

import Homepage from "./pages/homepage";
import Comparison from "./pages/comparison";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/" element={<Homepage />} />
        <Route path="/comparison" element={<Comparison />} />
        <Route path="/class-selector" element={<ClassSelector />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
