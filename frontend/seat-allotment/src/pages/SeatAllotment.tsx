import { useEffect, useState } from "react";

interface SeatAllotmentData {
  candidateName: string;
  studentId: string;
  preference: string;
  course: string;
  round: string;
  status: "LOCK" | "FLOAT" | "PENDING";
}
const baseURL = import.meta.env.VITE_BACKEND_URL;

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
        const res = await fetch(`${baseURL}/api/seat-allotment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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
      const res = await fetch(`${baseURL}/api/seat-allotment/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationNumber: allotment.studentId,
          status: newStatus,
        }),
      });

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
      <header className="bg-blue-950 text-white px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/cropped-logo-600-1.webp" alt="logo" className="h-10" />
            <div>
              <h1 className="text-xl font-bold">
                Shri Mata Vaishno Devi University
              </h1>
              <p className="text-sm">Admission Portal</p>
            </div>
          </div>
          <nav className="text-sm space-x-6">
            <a href="/login" className="hover:underline">
              Logout
            </a>
            <a href="/allotment" className="hover:underline">
              Seat Allotment
            </a>
            <a href="/profile" className="hover:underline">
              Profile
            </a>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Seat Allotment
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong className="font-medium">Error:</strong> {error}
            </div>
          )}

          {!allotment ? (
            <p className="text-gray-600">Loading seat allotment...</p>
          ) : (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block font-semibold mb-2">Status</label>
                <select
                  className="block w-full max-w-xs px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
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

                {status === "LOCK" && (
                  <div className="flex items-start gap-3 mt-4 p-4 border-l-4 border-red-600 bg-red-50 rounded shadow-sm">
                    <svg
                      className="w-5 h-5 text-red-600 mt-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 15v2m0-6a2 2 0 00-2 2v4h4v-4a2 2 0 00-2-2zm6 4V9a6 6 0 00-12 0v6"
                      />
                    </svg>
                    <p className="text-sm text-red-700">
                      <strong>Status is LOCKED.</strong> You cannot change it
                      any further.
                    </p>
                  </div>
                )}
              </div>

              <button
                className="mt-4 inline-flex items-center bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={status === "PENDING" || updating}
                onClick={() => handleStatusChange(status as "LOCK" | "FLOAT")}
              >
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default SeatAllotment;
