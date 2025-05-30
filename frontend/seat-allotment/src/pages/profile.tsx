import { useEffect, useState } from "react";
import { Input, Select } from "../components/select";
const baseURL = import.meta.env.VITE_BACKEND_URL;

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>("new");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");
  const applicationNumber = localStorage.getItem("applicationNumber");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${baseURL}/api/profile/${applicationNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile.");
      }
    };

    if (applicationNumber) fetchProfile();
  }, [applicationNumber, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${baseURL}/api/profile/${applicationNumber}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    }
  };

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <>
      {/* Header */}
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
            <ul className="flex gap-6 text-sm font-medium">
              <a href="/" className="hover:underline">
                Logout
              </a>
              <a href="/allotment" className="hover:underline">
                Seat Allotment
              </a>
              <a href="/profile" className="hover:underline">
                Profile
              </a>
            </ul>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-2xl min-h-screen">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-2">
          Edit Profile
        </h2>

        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Application Number"
              name="applicationNumber"
              value={applicationNumber}
              disabled
            />
            <Input
              label="Full Name"
              name="studentName"
              value={profile.studentName}
              onChange={handleChange}
            />
            <Input
              label="Father/Mother Name"
              name="fatherMotherName"
              value={profile.fatherMotherName}
              onChange={handleChange}
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleChange}
            />
            <Input label="Email" name="email" value={profile.email} />
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Academic Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="JEE CRL Rank"
              name="jeeCRL"
              value={profile.jeeCRL}
              onChange={handleChange}
              type="number"
            />
            <Select
              label="Category"
              name="category"
              value={profile.category}
              onChange={handleChange}
              options={["GEN", "SC", "ST", "OBC", "EWS"]}
            />
            <Input
              label="Category Rank"
              name="categoryRank"
              value={profile.categoryRank || ""}
              onChange={handleChange}
              type="number"
            />
            <Input
              label="Sports Marks (if applicable)"
              name="sportsMarks"
              value={profile.sportsMarks || ""}
              onChange={handleChange}
              type="number"
            />
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Course Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(7)].map((_, i) => (
              <Input
                key={i}
                label={`Course Choice ${i + 1}`}
                name={`courseChoice${i + 1}`}
                value={profile[`courseChoice${i + 1}`] || ""}
                onChange={handleChange}
              />
            ))}
          </div>
        </section>

        {error && <p className="text-red-600 font-medium mb-4">{error}</p>}
        {success && (
          <p className="text-green-600 font-medium mb-4">{success}</p>
        )}

        <div className="text-right">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2 rounded-lg transition"
          >
            Save Changes
          </button>
        </div>
      </main>
    </>
  );
};

export default Profile;
