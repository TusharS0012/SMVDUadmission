import { useEffect, useState } from "react";
import { Input, Select } from "../components/select";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>("new");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const token = localStorage.getItem("token");
  const applicationNumber = localStorage.getItem("applicationNumber");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/profile/${applicationNumber}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}//api/profile/${applicationNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }
      );

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
              <a href="/allotment">Seat Allotment</a>
              <a href="/profile">Profile</a>
            </ul>
          </nav>
        </div>
      </header>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-orange-300 shadow rounded-lg min-h-screen">
        <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            label="Course Choice 1"
            name="courseChoice1"
            value={profile.courseChoice1}
            onChange={handleChange}
          />
          <Input
            label="Course Choice 2"
            name="courseChoice2"
            value={profile.courseChoice2 || ""}
            onChange={handleChange}
          />
          <Input
            label="Course Choice 3"
            name="courseChoice3"
            value={profile.courseChoice3 || ""}
            onChange={handleChange}
          />
          <Input
            label="Course Choice 4"
            name="courseChoice4"
            value={profile.courseChoice4 || ""}
            onChange={handleChange}
          />
          <Input
            label="Course Choice 5"
            name="courseChoice5"
            value={profile.courseChoice5 || ""}
            onChange={handleChange}
          />
          <Input
            label="Course Choice 6"
            name="courseChoice6"
            value={profile.courseChoice6 || ""}
            onChange={handleChange}
          />
          <Input
            label="Course Choice 7"
            name="courseChoice7"
            value={profile.courseChoice7 || ""}
            onChange={handleChange}
          />
          <Input
            label="Sports Marks (if applicable)"
            name="sportsMarks"
            value={profile.sportsMarks || ""}
            onChange={handleChange}
            type="number"
          />
        </div>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {success && <p className="text-green-600 mt-4">{success}</p>}

        <div className="mt-6 text-right">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default Profile;
