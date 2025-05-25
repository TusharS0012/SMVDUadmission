import React, { useState } from "react";

export const RunAllocation: React.FC = () => {
  const [roundNumber, setRoundNumber] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const baseURL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_BACKEND_URL
      : window?.configs?.apiUrl || "/";
  
  const handleRun = async () => {
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `${baseURL}/api/admin/allocate-round`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ roundNumber }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setError(data.message || "Failed to run allocation");
      }
    } catch {
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-white">
      {/* Header */}
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

      {/* Main Content Card */}
      <main className="flex justify-center items-center mt-16 px-4 pb-20">
        <div
          className="w-full max-w-md bg-white rounded-lg shadow-lg p-6
                     shadow-gray-400/40"
        >
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Run Allocation Round
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Round Number
            </label>
            <input
              type="number"
              min={1}
              value={roundNumber}
              onChange={(e) => setRoundNumber(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleRun}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Run Round {roundNumber}
          </button>
          {message && <p className="text-green-600 mt-4">{message}</p>}
          {error && <p className="text-red-600 mt-4">{error}</p>}
        </div>
      </main>
    </div>
  );
};
