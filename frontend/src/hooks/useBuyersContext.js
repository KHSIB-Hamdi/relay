import { BuyersContext } from '../contexts/BuyersContext'
import { useContext } from 'react'

export const useBuyersContext = () => {
  const context = useContext(BuyersContext)

  if (!context) {
    throw Error('useBuyersContext must be used inside an BuyersContextProvider')
  }

  return context
}