import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [applicationNumber, setApplicationNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, applicationNumber }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("applicationNumber", data.applicationNumber);
      navigate("/profile");
    } else {
      setError(data.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-white">
      <header className="bg-transparent text-white px-6 py-4 shadow-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/cropped-logo-600-1.webp" alt="logo" className="h-10" />
            <h1 className="text-xl font-bold leading-tight">
              Shri Mata Vaishno Devi University
              <br />
              Admission Portal
            </h1>
          </div>
          <nav>
            <ul className="flex gap-6 text-sm">
              <li className="hover:underline cursor-pointer">Home</li>
              <li className="hover:underline cursor-pointer">Courses</li>
              <li className="hover:underline cursor-pointer">Help</li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex justify-center items-center mt-16 px-4 pb-20">
        <div
          className="w-full max-w-md bg-white rounded-lg shadow-lg p-8
                        // Add subtle shadow with a bit of opacity to soften edge
                        shadow-gray-400/40"
        >
          <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Student Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Number
              </label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>

            <p className="text-sm text-center text-gray-600 mt-4">
              Haven't registered yet?{" "}
              <Link
                to="/register"
                className="text-blue-600 hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;
