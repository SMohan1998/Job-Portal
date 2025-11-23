import React, { useEffect, useState } from "react";
import { getMyCompany } from "../services/companyservice";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const CompanyProfile = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);

  // remove /api from base
  const base = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

  useEffect(() => {
    getMyCompany()
      .then(res => {
        setCompany(res.data);
        localStorage.setItem("companyId", res.data._id);
      })
      .catch(() => setCompany(null));
  }, []);

  if (!company) {
    return (
      <p className="text-center mt-10 text-xl font-semibold">
        Company not found.{" "}
        <button
          onClick={() => navigate("/company/form")}
          className="text-blue-600 underline"
        >
          Create Company
        </button>
      </p>
    );
  }

  return (
    <main className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded-xl">

      <div className="flex flex-col items-center">
        <img
          src={company.logo ? `${base}/${company.logo}` : "/default-company.png"}
          alt="Company Logo"
          className="w-24 h-24 object-cover rounded-full border shadow-sm"
        />
      </div>

      <h2 className="text-2xl font-bold text-center mt-4">{company.name}</h2>

      <div className="mt-6 space-y-3 text-lg">
        <p><strong>Description:</strong> {company.description}</p>
        <p><strong>Location:</strong> {company.location}</p>
        <p>
          <strong>Website:</strong>{" "}
          <a className="text-blue-600" href={company.website} target="_blank" rel="noreferrer">
            {company.website}
          </a>
        </p>
      </div>

      <div className="text-center mt-6 space-x-3">
        <button
          onClick={() => navigate("/company/form")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Manage Company Profile
        </button>

        <button
          onClick={() => navigate(`/company/${company._id}`)}
          className="bg-gray-700 text-white px-4 py-2 rounded"
        >
          View Jobs Posted
        </button>
      </div>

    </main>
  );
};

export default CompanyProfile;
