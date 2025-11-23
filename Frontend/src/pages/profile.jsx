import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState({});
  const [resumeFile, setResumeFile] = useState(null);
  const [msg, setMsg] = useState('');
  const role = localStorage.getItem('role');

  useEffect(() => {
    API.get('/profiles')
      .then(res => setProfile(res.data))
      .catch(err => console.error('Profile fetch error:', err));
  }, []);

  const handleResumeChange = (e) => setResumeFile(e.target.files[0]);

  const uploadResume = async () => {
    if (!resumeFile) return setMsg('Select a file first');

    const formData = new FormData();
    formData.append('resume', resumeFile);

    try {
      await API.post('/profiles/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMsg('Resume uploaded successfully');

      const res = await API.get('/profiles');
      setProfile(res.data);
      setResumeFile(null);

    } catch (error) {
      setMsg(error.response?.data?.error || 'Upload failed');
    }
  };

  const deleteResume = async () => {
    if (!window.confirm('Delete resume?')) return;

    try {
      await API.delete('/profiles/resume');
      setMsg('Resume deleted');

      const res = await API.get('/profiles');
      setProfile(res.data);

    } catch (error) {
      setMsg(error.response?.data?.error || 'Delete failed');
    }
  };

  const API_ROOT = API.defaults.baseURL
    ? API.defaults.baseURL.replace(/\/api\/?$/, '')
    : '';

  return (
    <main className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">

      <h2 className="text-3xl font-bold mb-6 text-center">Profile</h2>

      {/* Basic User Info */}
      <div className="mb-10 text-center">
        <p><span className="font-semibold">Username:</span> {profile.username}</p>
        <p><span className="font-semibold">Email:</span> {profile.email}</p>
        <p><span className="font-semibold">Role:</span> {profile.role}</p>
      </div>

      {/* Role Based Buttons */}
      <div className="flex flex-col items-center gap-4 mb-8">

        {role === 'jobseeker' && (
          <Link
            to="/profile/jobseeker"
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Edit Job Seeker Profile
          </Link>
        )}

        {role === 'employer' && (
          <>
            <Link
              to="/profile/employer"
              className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
            >
              Edit Employer Profile
            </Link>

            <Link
              to="/company"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Manage Company Profile
            </Link>
          </>
        )}
      </div>

      {/* Resume Upload Section */}
      <div className="flex flex-col items-center gap-4">
        <input
          accept=".pdf,.doc,.docx"
          type="file"
          onChange={handleResumeChange}
          className="block w-full text-sm text-gray-500 
          file:mr-4 file:py-2 file:px-4 file:rounded 
          file:border-0 file:text-sm file:font-semibold 
          file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <div className="flex gap-3">
          <button
            onClick={uploadResume}
            className="bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 transition"
          >
            Upload Resume
          </button>

          <button
            onClick={deleteResume}
            className="bg-red-500 text-white py-3 px-6 rounded hover:bg-red-700 transition"
          >
            Delete Resume
          </button>
        </div>

        {profile.resume && (
          <p className="text-sm mt-2">
            Current resume:
            {' '}
            <a
              href={`${API_ROOT}/${profile.resume}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline ml-2"
            >
              View
            </a>
          </p>
        )}

        {msg && <p className="text-green-600 mt-2">{msg}</p>}
      </div>
    </main>
  );
};

export default Profile;
