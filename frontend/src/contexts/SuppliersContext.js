import { createContext, useReducer } from 'react'

export const SuppliersContext = createContext()

export const suppliersReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SUPPLIER': 
      return {
        suppliers: action.payload
      }
    case 'CREATE_SUPPLIER':
      return {
        suppliers: [action.payload, ...state.suppliers]
      }
    case 'UPDATE_SUPPLIER':
      const updatedIndex = state.suppliers.findIndex(supplier => supplier._id === action.payload._id);
      if (updatedIndex !== -1) {
          const updatedSuppliers = [...state.suppliers];
          updatedSuppliers[updatedIndex] = action.payload;
          return {
            ...state,
            suppliers: updatedSuppliers
          };
      }
      return state;  
    case 'DELETE_SUPPLIER':
      return {
        suppliers: state.suppliers.filter((w) => w._id !== action.payload._id)
      }
    default:
      return state
  }
}

export const SuppliersContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(suppliersReducer, {
    suppliers: []
  })

  return (
    <SuppliersContext.Provider value={{...state, dispatch}}>
      { children }
    </SuppliersContext.Provider>
  )
}