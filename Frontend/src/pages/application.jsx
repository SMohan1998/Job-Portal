import React, { useEffect, useState } from 'react';
import API from '../services/api';

const statusColors = {
  applied: 'bg-gray-200 text-gray-800',
  interviewed: 'bg-blue-200 text-blue-800',
  rejected: 'bg-red-200 text-red-800',
};

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const url = role === 'employer' ? '/applications/employer' : '/applications/jobseeker';
        const { data } = await API.get(url);
        setApplications(data);
        setFilteredApps(data);
      } catch (err) {
        console.error(err);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [role]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilter(value);
    if (value === 'all') setFilteredApps(applications);
    else setFilteredApps(applications.filter((a) => a.status === value));
  };

  const handleStatusChange = async (id, newStatus) => {
    const confirmChange = window.confirm(`Are you sure you want to change the status to "${newStatus}"?`);
    if (!confirmChange) return;
    try {
      const res = await API.put(`/applications/${id}/status`, { status: newStatus });
      setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status: res.data.status } : a)));
      setFilteredApps((prev) => prev.map((a) => (a._id === id ? { ...a, status: res.data.status } : a)));
      alert('Status updated successfully');
    } catch (err) {
      console.error('Status update error:', err.response?.data || err.message);
      alert('Failed to update status');
    }
  };

  // Employer: download applicant resume
  const downloadResume = async (appId) => {
    try {
      const res = await API.get(`/applications/${appId}/resume`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ''; // let browser pick filename from response headers if present
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Resume download error:', err);
      alert(err.response?.data?.msg || 'Failed to download resume');
    }
  };

  if (loading) return <p className="text-center mt-10">Loading applications...</p>;

  return (
    <main className="max-w-4xl mx-auto p-6 bg-white rounded shadow mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Applications</h2>

      {role === 'employer' && (
        <div className="mb-4 flex justify-end">
          <select value={filter} onChange={handleFilterChange} className="border border-gray-300 rounded-md p-2">
            <option value="all">All</option>
            <option value="applied">Applied</option>
            <option value="interviewed">Interviewed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      )}

      {filteredApps.length === 0 ? (
        <p className="text-center">No applications found.</p>
      ) : (
        <div className="flex flex-col divide-y">
          {filteredApps.map((app) => (
            <div key={app._id} className="p-4 hover:bg-gray-50 flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="flex-1">
                <p><span className="font-semibold">Job:</span> {app.job?.title}</p>
                <p><span className="font-semibold">Applicant:</span> {app.jobSeeker?.username || 'N/A'}</p>
                <p><span className="font-semibold">Status:</span> {app.status}</p>
              </div>

              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[app.status]}`}>
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </span>

              {role === 'employer' && (
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <select value={app.status} onChange={(e) => handleStatusChange(app._id, e.target.value)} className="border p-2 rounded">
                    <option value="applied">Applied</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  {app.resume && (
                    <button onClick={() => downloadResume(app._id)} className="bg-indigo-600 text-white px-3 py-1 rounded">
                      Download Resume
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Applications;
