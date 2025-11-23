import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <>
    <nav className="bg-blue-600 fixed left-0 top-0 right-0 w-full p-4 flex justify-between items-center text-white z-50 shadow-lg">
      <Link to="/" className="text-2xl font-extrabold">JobPortal</Link>

      <div className="space-x-6 flex items-center">

        {token ? (
          <>
            {/* Common */}
            <Link to="/job" className="hover:text-gray-200 transition">Jobs</Link>

            {/* Employer Only */}
            {role === 'employer' && (
              <>
                <Link to="/post-job" className="hover:text-gray-200 transition">Post Job</Link>
                <Link to="/profile/employer" className="hover:text-gray-200 transition">Employer Profile</Link>
                <Link to="/company" className="hover:text-gray-200 transition">Company Profile</Link>
                <Link to="/application" className="hover:text-gray-200 transition">Applications</Link>
              </>
            )}

            {/* Job Seeker Only */}
            {role === 'jobseeker' && (
              <>
                <Link to="/application" className="hover:text-gray-200 transition">Applications</Link>
                <Link to="/profile/jobseeker" className="hover:text-gray-200 transition">Job Seeker Profile</Link>
                <Link to="/recommendations" className="hover:text-gray-200 transition">Recommendations</Link>
              </>
            )}

            {/* Always visible after login */}
            <Link to="/profile" className="hover:text-gray-200 transition">Account</Link>
            {/*<Link to={`/company/${localStorage.getItem("companyId")}/jobs`}>
  Company Jobs
</Link>*/}
            
{role === "employer" && (
  <button
    onClick={() => {
      const companyId = localStorage.getItem("companyId");
      if (companyId) navigate(`/company/${companyId}`);
      else navigate("/company"); // user needs to create the company first
    }}
    className="hover:text-gray-200 transition"
  >
    Company Jobs
  </button>
)}
            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-200 transition">Login</Link>
            <Link to="/register" className="hover:text-gray-200 transition">Register</Link>
          </>
        )}

      </div>
    </nav>
     <div className="h-16" aria-hidden="true" />
    </>
  );
};

export default Navbar;
