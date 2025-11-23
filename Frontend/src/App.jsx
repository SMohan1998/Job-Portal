import React, {useEffect} from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/home';
import Navbar from './components/navbar';
import Login from './pages/login';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/reset-password';
import Register from './pages/register';
import Jobs from './pages/job';
import PostJob from './pages/post-job';
import EditJob from './pages/edit-job';
import Profile from './pages/profile';
import Applications from './pages/application';
import ApplyJob from './pages/applyjob';
import Recommendations from './pages/recommendations';
import JobSeekerProfile from './pages/jobseekerprofile';
import EmployerProfile from './pages/employerprofile';
import CompanyProfile from './pages/companyprofile';
import CompanyDetails from './pages/companydetails';
import CompanyJobs from './pages/companyjobs';
import EditEmployerProfile from './pages/edit-employer-profile';
import CompanyProfileForm from './pages/company-form';
import API from './services/api';

function App() {
  //always clear old login data when the app first loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if(!token) return; //return homepage
    API.get('/profiles')
    .then(() => {}) //valid token, keep session
    .catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      if(window.location.pathname !== '/') window.location.href = '/';
    });
  }, []);
  
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
        <Route path="/register" element={<Register />} />
        <Route path="/job" element={<Jobs />} />
        <Route path="/post-job" element={<PostJob />} />
        <Route path="/edit-job/:jobId" element={<EditJob />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/jobseeker" element={<JobSeekerProfile />} />
        <Route path="/profile/employer" element={<EmployerProfile />} />
        <Route path="/company" element={<CompanyProfile />} />
        <Route path="/company/:id" element={<CompanyDetails />} />
        <Route path="/application" element={<Applications />} />
        <Route path="/apply/:jobId" element={<ApplyJob />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/profile/employer/edit" element={<EditEmployerProfile />} />
        <Route path="/profile/company" element={<CompanyProfileForm />} />    
        <Route path="/company/form" element={<CompanyProfileForm />} />
        {/*<Route path="/company/:id/jobs" element={<CompanyJobs />} />*/}
  
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
