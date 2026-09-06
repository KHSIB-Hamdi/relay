import { createContext, useReducer } from 'react'

export const BuyersContext = createContext()

export const buyersReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BUYER': 
      return {
        buyers: action.payload
      }
    case 'CREATE_BUYER':
      return {
        buyers: [action.payload, ...state.buyers]
      }
    case 'DELETE_BUYER':
      return {
        buyers: state.buyers.filter((w) => w._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const BuyersContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(buyersReducer, {
    buyers: null
  })

  return (
    <BuyersContext.Provider value={{...state, dispatch}}>
      { children }
    </BuyersContext.Provider>
  )
}