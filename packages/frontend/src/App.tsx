import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import Login from "./pages/login";
import PasswordReset from "./pages/passwordReset";
import Register from "./pages/register";
import ClassSelector from "./pages/classSelector";
import Comparison from "./pages/comparison";
import VerifyEmail from "./pages/verifyEmail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<PasswordReset />} />
        <Route path="/register" element={<Register />} />
        <Route path="/class-selector" element={<ClassSelector />} />
        <Route path="/q2s-comparison" element={<Comparison />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
