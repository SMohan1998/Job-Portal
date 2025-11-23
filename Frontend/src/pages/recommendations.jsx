import React, { useEffect, useState } from 'react';
import { getRecommendations } from '../services/jobservice';

const Recommendations = () => {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await getRecommendations();
        setJobs(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetch();
  }, []);

  
return (
  <div className="max-w-4xl mx-auto p-6">
    <h2 className="text-2xl mb-4">Recommended Jobs</h2>

    {jobs.length === 0 ? (
      <p className="text-gray-600">No recommended jobs available. Update your skills or apply to some jobs to improve recommendations.</p>
    ) : (
      jobs.map(j => (
        <div key={j._id} className="p-4 bg-white rounded shadow mb-3">
          <h3 className="font-semibold">{j.title}</h3>
          <p className="text-sm">{j.description}</p>
        </div>
      ))
    )}
  </div>
  
  );
};

export default Recommendations;