import React, { useEffect, useState } from 'react';
import { getJobs, getEmployerJobs } from '../services/jobservice';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';  

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    async function fetchJobs() {
      try {
        //if logged in employer, fetch only their jobs
        if (role === 'employer') {
      const { data } = await getEmployerJobs();
      setJobs(data);
    }
    else {
      const { data } = await getJobs();
      setJobs(data);
    }
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
        setJobs([]);
      }
    }
    fetchJobs();
  }, [role]);


  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-4xl font-bold mb-8 text-center">Available Jobs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {jobs.length === 0 && <p className="col-span-full text-center">No jobs available</p>}
        {jobs.map((job) => (
          <div
            key={job._id}
            className="p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
            <p className="text-gray-700 mb-3 line-clamp-3">{job.description}</p>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-bold">Location:</span> {job.location}
              </p>
              <p>
                <span className="font-bold">Salary:</span> {job.salary || 'Negotiable'}
              </p>
              {/* Hide Apply button for employers */}
              {localStorage.getItem('role') !== 'employer' ? (
              <button className="mt-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300
              transition" onClick={() => navigate(`/apply/${job._id}`)}> Apply </button>
              ):(
                //if employer viewing their own job postings, show Edit/Delete buttons
                <div className="mt-4 flex gap-2">
                  <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-700"
                  onClick={() => navigate(`/edit-job/${job._id}`)}> Edit </button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={async () => {
                    if(!window.confirm('Are you sure you want to delete this job posting?')) return;
                    try {
                      await API.delete(`/jobs/${job._id}`);
                      setJobs(prev => prev.filter(j => j._id !== job._id));
                      alert('Job deleted successfully');
                    } catch (error) {
                      console.error('Failed to delete job:', error);
                      alert(error.response?.data?.msg || 'Failed to delete job');
                    }
                  }}> Delete </button>
                </div>
              )}
  
              {/*{role === 'jobseeker' && (
              <button className="mt-4 px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300
              transition" onClick={() => navigate(`/apply/${job._id}`)}> Apply </button>
              )}*/}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Jobs;