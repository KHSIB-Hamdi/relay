import { createContext, useReducer } from 'react'

export const RatingsContext = createContext()

export const ratingsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RATING': 
      return {
        ratings: action.payload
      }
    case 'CREATE_RATING':
      return {
        ratings: [action.payload, ...state.ratings]
      }
    case 'DELETE_RATING':
      return {
        ratings: state.ratings.filter((w) => w._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const RatingsContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ratingsReducer, {
    ratings: []
  })

  return (
    <RatingsContext.Provider value={{...state, dispatch}}>
      { children }
    </RatingsContext.Provider>
  )
}