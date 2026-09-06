import axios from 'axios'
import { API_URL, authHeader } from '../config/api';
 import {
   ARTICLE_LIST_REQUEST,
   ARTICLE_LIST_SUCCESS,
   ARTICLE_LIST_FAIL,
   ARTICLE_DETAILS_REQUEST,
   ARTICLE_DETAILS_SUCCESS,
   ARTICLE_DETAILS_FAIL,
   ARTICLE_CREATE_REVIEW_REQUEST,
   ARTICLE_CREATE_REVIEW_SUCCESS,
   ARTICLE_CREATE_REVIEW_FAIL,
 } from '../constants/articleConstants'

 

 export const listArticles = () => async (dispatch) => {
   try {
     dispatch({ type: ARTICLE_LIST_REQUEST })

    

     const { data } = await axios.get(`${API_URL}/articles`)

     dispatch({
       type: ARTICLE_LIST_SUCCESS,
       payload: data,
     })
   } catch (error) {
     dispatch({
       type: ARTICLE_LIST_FAIL,
       payload:
         error.response && error.response.data.message
           ? error.response.data.message
           : error.message,
     })
   }
 }


 export const listArticleDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: ARTICLE_DETAILS_REQUEST })

    

    const { data } = await axios.get(`${API_URL}/articles/${id}`)

    dispatch({
      type: ARTICLE_DETAILS_SUCCESS,
      payload: data,
    })
  } catch (error) {
    dispatch({
      type: ARTICLE_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
} 

export const createArticleReview = (articleId, review) => async (dispatch) => {
  try {
    dispatch({
      type: ARTICLE_CREATE_REVIEW_REQUEST,
    })
   

    

    await axios.post(`${API_URL}/articles/${articleId}/reviews`, review, { headers: authHeader() })

    dispatch({
      type: ARTICLE_CREATE_REVIEW_SUCCESS,
    })
  } catch (error) {
    dispatch({
      type: ARTICLE_CREATE_REVIEW_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    })
  }
}