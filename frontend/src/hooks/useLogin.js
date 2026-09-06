import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { API_URL } from '../config/api';

export const useLogin = () => {
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { dispatch } = useAuthContext()


  const login = async (username, password, rememberMe) => {
    setIsLoading(true)
    setErrors({})
 
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    })

    const jsonData = await response.json();

    if (!response.ok) {
        if (jsonData.errors && typeof jsonData.errors === 'object') {
            setErrors(jsonData.errors);
        } else {
            setErrors({ general: jsonData.message || 'An error occurred' }); 
        }
    } else {
      const userData = {
        token: jsonData.accessToken,
        foundUser: jsonData.foundUser, // If you have foundUser data
      };

      const userRememberMeData = {
        token: jsonData.longLivedToken,
        foundUser: jsonData.foundUser, // If you have foundUser data
      };
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify(userRememberMeData))
      } else {
        localStorage.setItem('user', JSON.stringify(userData))
      }

      dispatch({type: 'LOGIN', payload: jsonData})
    }
  
    setIsLoading(false)
  }

  return { login, isLoading, errors }
}