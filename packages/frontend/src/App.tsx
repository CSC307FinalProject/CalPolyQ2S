import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from './pages/homepage';
import Comparison from './pages/comparison';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/comparison" element={<Comparison/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
