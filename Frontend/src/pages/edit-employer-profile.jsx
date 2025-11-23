import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const EditEmployerProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: "",
    about: "",
  });

  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    API.get("/profiles")
      .then(res => {
        setForm({
          phone: res.data.phone || "",
          about: res.data.about || "",
        });
      })
      .catch(err => console.error("Failed to load profile", err));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
    await API.put("/profiles", {
      phone: form.phone,
      about: form.about
    });

      // Upload employer profile picture if selected
      
      if (profilePic) {
        const fd = new FormData();
        fd.append("profilePicture", profilePic);
        await API.post("/profiles/profile-picture", fd, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }

      alert("Employer profile updated");
      navigate("/profile/employer");
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update profile");
    }
  };


  return (
    <main className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Edit Employer Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>About</label>
          <textarea
            name="about"
            value={form.about}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>Profile Picture</label>
          <input
            type="file"
            onChange={e => setProfilePic(e.target.files[0])}
            accept="image/*"
            className="w-full"
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </main>
  );
};

export default EditEmployerProfile;
