import { createStore, combineReducers, applyMiddleware } from 'redux'
 import thunk from 'redux-thunk'
 import { composeWithDevTools } from 'redux-devtools-extension'
 import { articleListReducer, articleDetailsReducer, articleReviewCreateReducer } from './reducers/articleReducers'

 const reducer = combineReducers({
   articleList: articleListReducer,
   articleDetails: articleDetailsReducer,
   articleReviewCreate: articleReviewCreateReducer,
   
 })

 const userInfoFromStorage = localStorage.getItem('user')
   ? JSON.parse(localStorage.getItem('user'))
   : null

 const initialState = {
  userLogin: { },
 }

 const middleware = [thunk]

 const store = createStore(
   reducer,
   initialState,
   composeWithDevTools(applyMiddleware(...middleware))
 )

 export default store
