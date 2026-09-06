import React, { useState } from 'react';
import { API_URL } from '../../config/api';

const ResetPassword = ({ match }) => {
  // NOTE: the emailed link carries ?resetToken=..., but the backend resetPassword
  // handler does not consume it - it looks the account up by email instead.
  // See docs/AUDIT.md before changing this.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, newPassword: password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage('Password reset failed');
      }
    } catch (error) {
      setMessage('Error resetting password');
    }
  };

  return (
    <form className="login" >
      
        <h3>Reset Password</h3>
        <label>Email:</label>
        <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Nouveau mot de passe:</label>
        <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Confirmer mot de passe:</label>
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleResetPassword}>Reset Password</button>
        <p>{message}</p>
      
    </form>
  );
};

export default ResetPassword;