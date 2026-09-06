import React, {useState,  useEffect} from 'react'
import { Link, useParams } from 'react-router-dom'
 import { Row, Col, Image, ListGroup, Card } from 'react-bootstrap'
 import Rating from '../components/Rating'
 import { useDispatch, useSelector } from 'react-redux'
 import Message from '../components/Message'
 import Loader from '../components/Loader'
 import { listArticleDetails, createArticleReview } from '../actions/articleActions'
 import { ARTICLE_CREATE_REVIEW_RESET } from '../constants/articleConstants'
 import image from '../data/product6.jpg'


 const ArticlesList = () => {
  const { id } = useParams();
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const dispatch = useDispatch()
 
  

  const articleDetails = useSelector((state) => state.articleDetails)
  const { loading, error, article } = articleDetails

  const articleReviewCreate = useSelector((state) => state.articleReviewCreate)
  const {
    success: successArticleReview,
    error: errorArticleReview,
  } = articleReviewCreate

   useEffect(() => {
    if (successArticleReview) {
      alert('Article review submitted!')
      setRating(0)
      setComment('')
      dispatch({ type: ARTICLE_CREATE_REVIEW_RESET })
    }
    dispatch(listArticleDetails(id))
   }, [dispatch,  successArticleReview])

   const submitHandler = (e) => {
    e.preventDefault()
    dispatch(
      createArticleReview(id, {
        rating,
        comment,
      })
    )
  }

   
  
 
    return (
      <>
        <Link className='btn btn-light my-3' to='/article-home'>
          Go Back
        </Link>
        {loading ? 
        <Loader /> :
        error ?
        <Message variant='danger'>{error}</Message>:(
          <>
          <Row>
          <Col md={6}>
            <Image src={image} alt={article.name} fluid />
          </Col>
          <Col md={3}>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h3>{article.name}</h3>
              </ListGroup.Item>
             
              <ListGroup.Item>
                <Rating
                  value={article.rating}
                  text={`${article.numReviews} reviews`}
                />
              </ListGroup.Item>
              
              <ListGroup.Item>Description: {article.description}</ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>
                      <strong>{article.prices} TND</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <h3>Reviews</h3>
            {article.reviews.length === 0 && <Message>No Reviews</Message>}
               <ListGroup variant='flush'>
                 {article.reviews.map((review) => (
                   <ListGroup.Item key={review._id}>
                     <p>{review.buyer}</p>
                     <Rating value={review.rating} />
                     <p>{review.createdAt.substring(0, 10)}</p>
                     <p>{review.comment}</p>
                   </ListGroup.Item>
                 ))}
                 <ListGroup.Item>
                 {errorArticleReview && (
                     <Message variant='danger'>{errorArticleReview}</Message>
                   )}
                     <form className="login" onSubmit={submitHandler}>
                     <div>
                       <h2>Write a review</h2>
                     </div>
                     <div>
                       <label htmlFor="rating">Rating</label>
                       <select id="rating" value={rating}
                        onChange={(e) => setRating(e.target.value)}>
                           <option value="">Select</option>
                           <option value="1">1- Bad</option>
                           <option value="2">2- Fair</option>
                           <option value="3">3- Good</option>
                           <option value="4">4- Very good</option>
                           <option value="5">5- Excelent</option>

                       </select>
                     </div>
                       <div>
                       <label htmlFor="comment">Comment</label>
                       <textarea
                         id="comment"
                         value={comment}
                         onChange={(e) => setComment(e.target.value)}
                       ></textarea>
                     </div>
                    
                     <div>
                       
                       <button  >
                         Submit
                       </button>
                     </div>
                     
                   </form>
                     
                 </ListGroup.Item>
              </ListGroup>
          </Col>
        </Row>
        </>
        )

        }
        

        
      </>
    )
  }
 
  export default ArticlesList;