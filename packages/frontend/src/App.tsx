import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import ClassSelector from "./pages/classSelector";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/class-selector" element={<ClassSelector />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
