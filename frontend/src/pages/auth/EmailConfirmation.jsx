import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config/api';

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [confirmationMessage, setConfirmationMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/confirm?code=${code}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();

        if (response.ok) {
          setConfirmationMessage(data.message);
        } else {
          setConfirmationMessage('Email confirmation failed');
        }
      } catch (error) {
        setConfirmationMessage('Error confirming email');
      }
    };

    confirmEmail();
  }, [code]);

  return (
    <div>
      <h2>Email Confirmation</h2>
      <p>{confirmationMessage}</p>
    </div>
  );
};

export default EmailConfirmation;

