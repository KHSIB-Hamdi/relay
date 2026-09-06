import { RatingsContext } from '../contexts/RatingsContext'
import { useContext } from 'react'

export const useRatingsContext = () => {
  const context = useContext(RatingsContext)

  if (!context) {
    throw Error('useRatingsContext must be used inside an RatingsContextProvider')
  }

  return context
}