import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postJob } from '../services/jobservice';

const PostJob = () => {
  const [job, setJob] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setJob({ ...job, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await postJob(job);
      navigate('/jobs');
    } catch (error) {
      setMsg(error.response?.data?.msg || 'Failed to post job');
    }
  };

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Post a Job</h2>
      {msg && <p className="text-red-600 mb-4 text-center">{msg}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={job.title}
          onChange={handleChange}
          required
          className="p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="description"
          rows="4"
          placeholder="Job Description"
          value={job.description}
          onChange={handleChange}
          required
          className="p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="requirements"
          rows="3"
          placeholder="Job Requirements"
          value={job.requirements}
          onChange={handleChange}
          required
          className="p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={job.location}
          onChange={handleChange}
          required
          className="p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="salary"
          placeholder="Salary"
          value={job.salary}
          onChange={handleChange}
          className="p-3 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
        >
          Post Job
        </button>
      </form>
    </main>
  );
};

export default PostJob;