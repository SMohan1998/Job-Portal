import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const CompanyJobs = () => {
  const { id } = useParams();
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    API.get(`/companies/${id}`)
      .then(res => setCompanyData(res.data))
      .catch(() => setCompanyData(null));
  }, [id]);

  if (!companyData) return <p className="text-center mt-10">Company not found</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {companyData.name} – Posted Jobs
      </h1>

      {companyData.jobs?.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <ul className="space-y-4">
          {companyData.jobs.map((job) => (
            <li key={job._id} className="border rounded p-4 shadow-sm">
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p>{job.location}</p>
              <p>Salary: {job.salary}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default CompanyJobs;
