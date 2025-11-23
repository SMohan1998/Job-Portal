import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authservice';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const { data } = await login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userId', data.userId);
      //navigate('/');
      if(data.role === 'employer') { //navigate to role specific page
        navigate('/post-job');
      } else {
        navigate('/job');
      }
    } catch (error) {
      setMsg(error.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded shadow-lg">
        <h2 className="text-3xl font-semibold text-center mb-6">Login</h2>
        {msg && <p className="mb-4 text-red-600 text-center">{msg}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 rounded border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 py-3 rounded text-white font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
        <Link to="/forgot-password" className="text-blue-600 text-sm hover:underline mt-2 block text-center">
          Forgot Password?
        </Link>
      </form>
    </div>
  );
};

export default Login;