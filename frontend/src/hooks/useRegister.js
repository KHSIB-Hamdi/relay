import { useState } from 'react'
import { useAuthContext } from './useAuthContext'
import { API_URL } from '../config/api';

export const useRegister = () => {
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const { dispatch } = useAuthContext()

    const register = async (username, email, password, address, contact, domain) => {
        setIsLoading(true) 
        setErrors({})

        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, email, password, address, contact, domain})
        })
        

        const jsonData = await response.json();

        if (!response.ok) {
            if (jsonData.errors && typeof jsonData.errors === 'object') {
                setErrors(jsonData.errors); // Set field-specific errors
            } else {
                setErrors({ general: jsonData.message || 'An error occurred' }); // General error message
            }
        } else {
            localStorage.setItem('registration', JSON.stringify(jsonData));
            dispatch({ type: 'LOGIN', payload: jsonData });
        }
        setIsLoading(false)
        
    }

    return { register, isLoading, errors}
}