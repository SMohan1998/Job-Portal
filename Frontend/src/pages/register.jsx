import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authservice';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    companyName: '',
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    if(!form.role){
      setMsg('Please select a role');
      return;
    }
    if(form.role === 'employer' && !form.companyName){
      setMsg('Please enter your company name');
      return;
    }
    try {
      await register(form);
      navigate('/login');
    } catch (error) {
      setMsg(error.response?.data?.msg || error.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">Register</h2>
        {msg && <p className="mb-4 text-red-600 text-center">{msg}</p>}
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="w-full mb-4 rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full mb-4 rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mb-4 rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full mb-6 rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>Select Role</option>
          <option value="jobseeker">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>
        {form.role === 'employer' && (
          <input
            name="companyName"
            placeholder="Company Name"
            value={form.companyName}
            onChange={handleChange}
            required
            className="w-full mb-6 rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        <button
          type="submit"
          className="w-full bg-blue-600 py-3 rounded text-white font-semibold hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;