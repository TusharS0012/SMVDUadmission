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

  useEffect(() => {
    const fetchAllotment = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You are not authenticated.");
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seat-allotment`, {
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
        console.log(data);
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
        `{BACKEND_URL}/api/seat-allotment`,
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

      // Optimistically update UI
      setAllotment((prev) => prev && { ...prev, status: newStatus });
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }
  if (!allotment) {
    return <p>Loading seat allotment...</p>;
  }

  return (
    <div>
      <h2>Seat Allotment</h2>
      <p>
        <strong>Candidate:</strong> {allotment.candidateName}
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

      <div style={{ marginTop: "1rem" }}>
        <label>
          <strong>Status:</strong>{" "}
          <select
            value={allotment.status}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value as any)}
          >
            <option value="LOCK">LOCK</option>
            <option value="FLOAT">FLOAT</option>
            <option value="PENDING">PENDING</option>
          </select>
        </label>
        {updating && <span style={{ marginLeft: 8 }}>Updating…</span>}
      </div>
    </div>
  );
};

export default SeatAllotment;
