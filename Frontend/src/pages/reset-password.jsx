import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authservice';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword(token, newPassword);
      navigate("/login");
    } catch {
      setMsg("Invalid or expired token.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form className="bg-white p-6 rounded shadow w-96" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        {msg && <p className="text-center text-red-600 mb-3">{msg}</p>}

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-3 border rounded mb-4"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white py-2 rounded">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;