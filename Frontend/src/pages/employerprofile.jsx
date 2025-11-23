import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const IMAGE_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "https://job-portal-uhh4.onrender.com";

const EmployerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    API.get("/profiles/employer")
      .then((res) => setProfile(res.data))
      .catch((e) => console.error("Employer profile load error:", e));
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("profilePicture", file);

    try {
      await API.post("/profiles/profile-picture", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const res = await API.get("/profiles/employer");
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!profile) return <div className="pt-24 container">Loading...</div>;

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Employer Profile</h2>

      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-4">
        <img
          src={
            profile.profilePicture
              ? `${IMAGE_BASE_URL}${profile.profilePicture}`
              : "/default-avatar.png"
          }
          alt="avatar"
          className="w-28 h-28 rounded-full object-cover border-2 border-blue-500"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="mt-2"
        />
        <button
          onClick={handleUpload}
          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
        >
          Upload Photo
        </button>
      </div>

      {/* Profile Info */}
      <div className="space-y-2 text-center text-lg">
        <p>
          <strong>Username:</strong> {profile.username}
        </p>
        <p>
          <strong>Email:</strong> {profile.email}
        </p>
        <p>
          <strong>Phone:</strong> {profile.phone || "—"}
        </p>
        <p>
          <strong>About:</strong> {profile.about || "—"}
        </p>
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <Link
          to="/profile/employer/edit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Edit Profile
        </Link>

        <Link
          to="/company/form"
          className="bg-green-600 text-white px-3 py-1 rounded"
        >
          Manage Company Profile
        </Link>
      </div>
    </main>
  );
};

export default EmployerProfile;
