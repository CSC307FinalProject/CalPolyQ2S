import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import Login from "./pages/login";
import Register from "./pages/register";
import ResetPassword from "./pages/resetPassword";
import ClassSelector from "./pages/classSelector";
import Comparison from "./pages/comparison";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/class-selector" element={<ClassSelector />} />
        <Route path="/q2s-comparison" element={<Comparison />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
