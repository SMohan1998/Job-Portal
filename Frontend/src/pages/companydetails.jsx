import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../services/api";

const CompanyDetails = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // remove /api from base path
  const base = (API.defaults.baseURL || "").replace(/\/api\/?$/, "");

  useEffect(() => {
    API.get(`/companies/${id}`)
      .then((res) => {
        setCompany(res.data.company);
        setJobs(res.data.jobs || []);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return <p className="text-center mt-10 text-lg font-semibold">Loading company...</p>;

  if (notFound)
    return <p className="text-center mt-10 text-lg text-red-600">Company not found</p>;

  return (
    <main className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <div className="flex items-center gap-6">
        {company.logo ? (
          <img
  src={`${base}/${company.logo}`}
  alt="company logo"
  className="w-24 h-24 rounded border object-cover"
/>
          //<img
            //src={`${base}/${company.logo}`}
            //alt="company logo"
            //className="w-24 h-24 rounded border object-cover"
          ///>
        ) : (
          <div className="w-24 h-24 rounded bg-gray-300 flex items-center justify-center">
            <span>No Logo</span>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-gray-700">{company.location}</p>
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              {company.website}
            </a>
          )}
        </div>
      </div>

      <p className="mt-6 text-gray-800 leading-relaxed">{company.description}</p>

      <hr className="my-8" />

      <h2 className="text-xl font-bold mb-4">Jobs Published by This Company</h2>

      {jobs.length === 0 ? (
        <p className="text-gray-500">No jobs posted yet</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              to={`/apply/${job._id}`}
              key={job._id}
              className="block border p-4 rounded hover:bg-gray-100 transition"
            >
              <h3 className="text-lg font-semibold">{job.title}</h3>
              <p className="text-sm text-gray-600">{job.location}</p>
              <p className="text-sm text-gray-600">Salary: {job.salary || "Not Mentioned"}</p>
              <p className="text-xs text-gray-500">
                Posted: {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default CompanyDetails;
