import { AuthContext } from '../contexts/AuthContext'
import { useContext } from 'react'

export const useAuthContext = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw Error('useAuthContext must be used inside an AuthContextProvider')
  }

  const { user, dispatch } = context;

  // Extract the token property from the user object
  const token = user ? user.token : null;
  const foundUser = user ? user.foundUser : null;

  return { user, dispatch, token,foundUser };

}