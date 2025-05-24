import React, { useEffect, useState } from "react";

interface SeatAllotmentData {
  candidateName: string;
  studentId: string;
  preference: string;
  course: string;
  round: string;
  status: "LOCK" | "FLOAT" | "PENDING";
}

const SeatAllotment = () => {
  const [allotment, setAllotment] = useState<SeatAllotmentData | null>(null);
  const [error, setError] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [status, setStatus] = useState<"LOCK" | "FLOAT" | "PENDING">("FLOAT");

  useEffect(() => {
    const fetchAllotment = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated.");
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/seat-allotment`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || res.statusText);
        }

        const data: SeatAllotmentData = await res.json();
        setAllotment(data);
        setStatus(data.status);
      } catch (err: any) {
        setError(err.message || "Failed to fetch seat allotment.");
      }
    };

    fetchAllotment();
  }, []);

  const handleStatusChange = async (newStatus: "LOCK" | "FLOAT") => {
    if (!allotment) return;
    setUpdating(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/seat-allotment/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationNumber: allotment.studentId,
            status: newStatus,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || res.statusText);
      }

      setAllotment((prev) => prev && { ...prev, status: newStatus });
      setStatus(newStatus);
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <header className="bg-blue-950 text-white px-6 py-4 shadow">
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
              <a href="/login">Logout</a>
              <a href="/SeatAllotment">Seat Allotment</a>
              <a href="/profile">Profile</a>
            </ul>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto mt-10 p-6 bg-orange-300 shadow rounded-lg min-h-screen">
        <h2 className="text-2xl font-semibold mb-6">Seat Allotment</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {!allotment ? (
          <p>Loading seat allotment...</p>
        ) : (
          <div className="space-y-4">
            <p>
              <strong>Candidate Name:</strong> {allotment.candidateName}
            </p>
            <p>
              <strong>Preference Number:</strong> {allotment.preference}
            </p>
            <p>
              <strong>Course:</strong> {allotment.course}
            </p>
            <p>
              <strong>Round:</strong> {allotment.round}
            </p>
            <div>
              <label className="block font-semibold mb-1">Status</label>
              <select
                className="px-4 py-2 border bg-white rounded w-full max-w-xs"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "LOCK" | "FLOAT" | "PENDING")
                }
                disabled={updating || allotment.status === "LOCK"}
              >
                <option value="LOCK">LOCK</option>
                <option value="FLOAT">FLOAT</option>
                <option value="PENDING">PENDING</option>
              </select>
                {status == "LOCK" && (
                  <span className="text-red-600 mt-2">
                    You cannot change the status once it is LOCKED.
                  </span>
                )}
            </div>

            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
              disabled={status === "PENDING" || updating}
              onClick={() => handleStatusChange(status as "LOCK" | "FLOAT")}
            >
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SeatAllotment;
