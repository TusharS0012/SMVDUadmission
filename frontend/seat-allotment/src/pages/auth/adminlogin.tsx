import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_BACKEND_URL;

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(`${baseURL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        navigate("/admin/allocate");
      } else {
        setError(data.message || "Admin login failed");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <>
      <header className="bg-blue-950 text-white px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/cropped-logo-600-1.webp" alt="logo" className="h-10" />
            <h1 className="text-xl font-bold leading-tight">
              Shri Mata Vaishno Devi University
              <br />
              Admin Panel
            </h1>
          </div>
          <nav>
            <ul className="flex gap-6 text-sm font-medium">
              <a href="/" className="hover:underline">
                User Portal
              </a>
              <a href="/admin/login" className="hover:underline">
                Admin Login
              </a>
            </ul>
          </nav>
        </div>
      </header>

      {/* Login Form Card */}
      <main className="flex items-center bg-gradient-to-b from-blue-950 to-white justify-center min-h-[calc(100vh-80px)] bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Admin Login
          </h2>
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Login as Admin
            </button>
          </form>
        </div>
      </main>
    </>
  );
};
