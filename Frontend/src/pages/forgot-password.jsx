import React, { useState } from 'react';
import { requestPasswordReset } from '../services/authservice';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    try {
      const res = await requestPasswordReset(email);
      //backend returns {msg} or {error}
      setMsg(res.data?.msg || "Password reset email sent! Check your inbox.");
    } catch(err){
      console.error('Password reset error:', err);
      const serverMsg = err.response?.data?.error || err.response?.data?.msg || "Error sending reset link.";
      setMsg(serverMsg);
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow w-96" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center">Forgot Password</h2>
        {msg && <p className={`text-center mb-3 ${isError ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}

        <input
          type="email"
          placeholder="Enter your registered email"
          className="w-full p-3 border rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">Send Reset Link</button>
      </form>
    </div>
  );
};

export default ForgotPassword;