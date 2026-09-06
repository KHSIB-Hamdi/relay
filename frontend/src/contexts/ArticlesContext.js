import { createContext, useReducer } from 'react'

export const ArticlesContext = createContext()

export const articlesReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ARTICLE': 
      return {
        articles: action.payload
      }
    case 'CREATE_ARTICLE':
      return {
        articles: [action.payload, ...state.articles]
      }
    case 'UPDATE_ARTICLE':
      const updatedIndex = state.articles.findIndex(article => article._id === action.payload._id);
      if (updatedIndex !== -1) {
          const updatedArticles = [...state.articles];
          updatedArticles[updatedIndex] = action.payload;
          return {
            ...state,
            articles: updatedArticles
          };
      }
      return state;  
    case 'DELETE_ARTICLE':
      return {
        articles: state.articles.filter((w) => w._id !== action.payload._id)
      }
    case 'ARTICLE_LIST_FAIL':
      return { loading: false, error: action.payload }  
    default:
      return state
  }
}



export const ArticlesContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(articlesReducer, {
    articles: []
  })

  return (
    <ArticlesContext.Provider value={{...state, dispatch}}>
      { children }
    </ArticlesContext.Provider>
  )
}