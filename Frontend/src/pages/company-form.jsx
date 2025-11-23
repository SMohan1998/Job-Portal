import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const CompanyProfileForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    description: "",
    location: "",
    website: "",
  });

  const [logo, setLogo] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    API.get("/companies/mine")
      .then(res => {
        if (res.data) {
          setCompany(res.data);
          setForm({
            companyName: res.data.companyName || "",
            description: res.data.description || "",
            location: res.data.location || "",
            website: res.data.website || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  {/*const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    let savedCompany;

    if (company) {
      // Update existing company
      const updateRes = await API.put(`/companies/${company._id}`, {
        name: form.companyName,
        description: form.description,
        location: form.location,
        website: form.website,
      });
      savedCompany = updateRes.data.company;
    } else {
      // Create new company
      const createRes = await API.post("/companies", {
        name: form.companyName,
        description: form.description,
        location: form.location,
        website: form.website,
      });
      savedCompany = createRes.data.company;
    }

    if (logo) {
      const fd = new FormData();
      fd.append("logo", logo);
      await API.post(`/companies/${savedCompany._id}/logo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    alert("Company profile saved");
    navigate(`/company/${savedCompany._id}`);
  } catch (err) {
    console.error(err);
    alert("Company update failed");
  }
};*/}

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const fd = new FormData();
    fd.append("name", form.companyName);
    fd.append("description", form.description);
    fd.append("location", form.location);
    fd.append("website", form.website);

    if (logo) {
      fd.append("logo", logo);
    }

    let response;

    if (company) {
      response = await API.put(`/companies/${company._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      response = await API.post("/companies", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    const savedCompany = response.data.company || response.data;
        localStorage.setItem("companyId", savedCompany._id);


    alert("Company profile saved");
    navigate(`/company/${savedCompany._id}`);
  } catch (err) {
    console.error(err);
    alert("Company update failed");
  }
};


  const base = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

  return (
    <main className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-xl font-bold mb-4">Company Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label>Company Name</label>
          <input
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          />
        </div>

        <div>
          <label>Location</label>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          />
        </div>

        <div>
          <label>Website</label>
          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full border px-2 py-2 rounded"
          />
        </div>

        <div>
          <label>Upload Logo</label>
          <input
            type="file"
            onChange={e => setLogo(e.target.files[0])}
            accept="image/*"
            className="w-full"
          />
        </div>

        {company?.logo && (
  <div>
    <p>Current Logo:</p>
    <img
      src={`${base}/${company.logo}`}
      alt="Company Logo"
      className="w-28 h-28 rounded border"
    />
  </div>
)}

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Save Company Details
        </button>
      </form>

      {company && (
        <button
          onClick={() => navigate(`/company/${company._id}`)}
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded"
        >
          View Company Page
        </button>
      )}
    </main>
  );
};

export default CompanyProfileForm;
