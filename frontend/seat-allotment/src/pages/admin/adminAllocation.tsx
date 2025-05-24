import React, { useState } from "react";
export const RunAllocation: React.FC = () => {
  const [roundNumber, setRoundNumber] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const handleRun = async () => {
    setMessage("");
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/allocate-round`,
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
    <div className="max-w-md mx-auto mt-10 p-6 shadow-lg rounded-xl bg-white">
      <h2 className="text-2xl font-semibold mb-4">Run Allocation Round</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium">Round Number</label>
        <input
          type="number"
          min={1}
          value={roundNumber}
          onChange={(e) => setRoundNumber(Number(e.target.value))}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <button
        onClick={handleRun}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Run Round {roundNumber}
      </button>
      {message && <p className="text-green-600 mt-4">{message}</p>}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};
