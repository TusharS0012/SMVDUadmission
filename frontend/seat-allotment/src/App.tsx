import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import SeatAllotment from "./pages/SeatAllotment";
import { AdminLogin } from "./pages/auth/adminlogin";
import { RunAllocation } from "./pages/admin/adminAllocation";
import Register from "./pages/auth/register";
import Profile from "./pages/profile";

function App() {
  return (
    <Router>
      <Routes>
        {/* Student routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/allotment" element={<SeatAllotment />} />
        <Route path="/profile" element={<Profile />} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/allocate" element={<RunAllocation />} />
      </Routes>
    </Router>
  );
}

export default App;
