import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import { API_URL } from '../../config/api';

const VerifyOTP = () => {
  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');

  const handleGenerateOTP = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setVerificationStatus('OTP sent to your email.');
      } else {
        setVerificationStatus('Error sending OTP.');
      }
    } catch (error) {
      setVerificationStatus('Error sending OTP.');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-otp?code=${otp}`);
      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('OTP verified successfully!');
      } else {
        setVerificationStatus('Invalid OTP');
      }
    } catch (error) {
      setVerificationStatus('Error verifying OTP');
    }
  };

  return (
    <form className="login" >
      
        <label>Email: </label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button onClick={handleGenerateOTP}>Générer code de vérification</button>
     
      
        <label>Code de verification: </label>
        <input type="text" value={otp} onChange={(e) => setOTP(e.target.value)} />
        <button onClick={handleVerifyOTP}>Vérifier le code</button>
        <p >{verificationStatus}</p>
        <div className="text-center py-4">
            <span ><Link className='text-red-500' to="/reset-password">Réinitialiser mot de passe</Link></span>
        </div>
    </form>
  );
};

export default VerifyOTP;
