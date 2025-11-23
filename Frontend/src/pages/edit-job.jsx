import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getJobs, updateJob } from "../services/jobservice";

const EditJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
  });

  useEffect(() => {
    async function fetchJob() {
      try {
        const { data } = await getJobs();  // get all jobs for current employer
        const selected = data.find(j => j._id === jobId);
        setJob(selected);
      } catch (error) {
        console.log(error);
      }
    }
    fetchJob();
  }, [jobId]);

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJob(jobId, job);
      navigate("/job");
    } catch (error) {
      console.log(error);
      alert("Error updating job");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow mt-10 rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Job</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          value={job.title}
          onChange={handleChange}
          placeholder="Job Title"
          className="w-full p-3 border rounded mb-3"
          required
        />
        <textarea
          name="description"
          value={job.description}
          onChange={handleChange}
          placeholder="Description"
          className="w-full p-3 border rounded mb-3"
          rows="4"
          required
        />
        <textarea
          name="requirements"
          value={job.requirements}
          onChange={handleChange}
          placeholder="Requirements"
          className="w-full p-3 border rounded mb-3"
          rows="3"
        />
        <input
          name="location"
          value={job.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-3 border rounded mb-3"
        />
        <input
          name="salary"
          value={job.salary}
          onChange={handleChange}
          placeholder="Salary"
          className="w-full p-3 border rounded mb-3"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded mt-2"
        >
          Update Job
        </button>
      </form>
    </div>
  );
};

export default EditJob;