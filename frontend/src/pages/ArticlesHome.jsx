import React, {  useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import Article from '../components/Article'
import { useDispatch, useSelector } from 'react-redux'
import { listArticles } from '../actions/articleActions'
import Message from '../components/Message'
import Loader from '../components/Loader'
import { Header } from '../components';



const ArticlesHome = () => {
  const dispatch = useDispatch()

  const articleList = useSelector((state) => state.articleList)
  const { loading, error, articles } = articleList

  useEffect(() => {
    dispatch(listArticles())
  }, [dispatch])

  return (
   
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header title="Articles" />
      {loading ? (
         <Loader/>
       ) : error ? (
         <Message variant='danger'>{error}</Message>
       ) : (
         <Row>
           {articles.map((article) => (
             <Col key={article._id} sm={12} md={6} lg={4} xl={3}>
               <Article article={article} />
             </Col>
           ))}
         </Row>
       )}
    
    </div>
  )
}

export default ArticlesHome;