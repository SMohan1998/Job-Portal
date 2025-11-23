import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../services/api';

const ApplyJob = () => {
  const { jobId } = useParams();
  const [coverLetter, setCoverLetter] = useState('');
  const [profile, setProfile] = useState({});
  const [useExisting, setUseExisting] = useState(true);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  //derive API root for file links if needed
  const API_ROOT = API.defaults.baseURL ? API.defaults.baseURL.replace(/\/api\/?$/, '') : '';

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        // load profile
        const p = await API.get('/profiles');
        if (cancelled) return;
        setProfile(p.data);
        //if user has a profile resume, default use existing to true
        setUseExisting(!!p.data.resume);
        // fetch user applications to check if already applied to this job
        const apps = await API.get('/applications/jobseeker');
        if (cancelled) return;
        const myApp = (apps.data || []).find(a => a.job && a.job._id === jobId);
        if (myApp) {
          setAlreadyApplied(myApp.status !== 'rejected');
          setApplicationStatus(myApp.status);
        } else {
          setAlreadyApplied(false);
          setApplicationStatus(null);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

    const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUseExisting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    //prevent employers from applying to jobs
    if(localStorage.getItem('role') === 'employer'){
      setMsg('Employers cannot apply to jobs.');
      return;
    }
    //prevent multiple applications
    if(alreadyApplied && applicationStatus !== 'rejected'){
      setMsg(`You have already applied to this job. Current status: ${applicationStatus}`);
      return;
    }

    try{
      let res;
      if(file){
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', jobId);
        formData.append('coverLetter', coverLetter || '');
        res = await API.post('/applications', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }else{
        //if using exising resume but no profile resume exists, warn user
        if(useExisting && !profile.resume){
          setMsg('No profile resume found. Please upload a resume.');
          return;
        }
        res = await API.post('/applications', { jobId, coverLetter });
      }
      console.log('Application response:', res.data);
      setMsg('Application submitted!');
      setCoverLetter('');
      setFile(null);
      setAlreadyApplied(true);
      setApplicationStatus(res.data.status || 'applied');
    } catch (err) {
      console.error('Apply error:', err);
      setMsg(err.response?.data?.msg || err.response?.data?.error || 'Error submitting application');
    }
  };

  if(loading){
    return <p className="p-6 text-center">Loading...</p>;
  }
  return (
    <div className="max-w-xl mx-auto p-6 mt-8 bg-white rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4">Apply for Job</h2>
      {alreadyApplied && applicationStatus !== 'rejected' && (
        <div className="mb-4 p-3 border rounded bg-yellow-50 text-yellow-800">
          You have already applied to this job. Current status: <strong>{applicationStatus}</strong>
        </div>
      )}
      {profile.resume ? (
        <div className="mb-4">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={useExisting}
              onChange={() => setUseExisting(true)}
            />
            <span>Use profile resume ({profile.resume ? profile.resume.split('/').pop() : 'resume'})</span>
          </label>
          <label className="flex items-center gap-3 mt-2">
            <input
              type="radio"
              checked={!useExisting}
              onChange={() => setUseExisting(false)}
            />
            <span>Upload a new resume</span>
          </label>
        </div>
      ) : (
        <p className="mb-4 text-sm text-gray-600">No profile resume found — please upload one or attach below.</p>
      )}

      {!useExisting && (
        <div className="mb-4">
          <input accept=".pdf,.doc,.docx"type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col">
        <label htmlFor="coverLetter" className="mb-2 font-medium">Cover Letter</label>
        <textarea
          id="coverLetter"
          rows="6"
          placeholder="Write your cover letter here..."
          className="border border-gray-300 rounded-md p-3 mb-4 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          required
        />
        <button
          type="submit" disabled={alreadyApplied && applicationStatus !== 'rejected'}
          className={`bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500
          ${alreadyApplied && applicationStatus !== 'rejected' ? 'opacity-50 cursor-not-allowed' : ''}`}  
        >
          Submit Application
        </button>
      </form>

      {msg && <p className="mt-4 text-center text-red-600">{msg}</p>}
      {/*quick line to view profile resume*/}
      {profile.resume && (
        <p className="mt-4 text-sm text-gray-600">
          View Profile Resume:
          {''}
          <a href={`${API_ROOT}/${profile.resume}`} target="_blank" rel="noreferrer" className="text-blue-600 underline ml-2">
          Open
          </a>
        </p>
      )}
    </div>
  );
};

export default ApplyJob;