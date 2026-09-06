import React from 'react'
import { Link } from 'react-router-dom'
import { Card } from 'react-bootstrap'
import Rating from './Rating'
import img from '../data/product6.jpg'

const Article = ({ article }) => {
  return (
    <Card className='my-3 p-3 rounded'>
      <Link to={`/article/${article._id}`}>
        <Card.Img src={img} variant='top' />
      </Link>

      <Card.Body>
        <Link to={`/article/${article._id}`}>
          <Card.Title as='div'>
            <strong>{article.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='div'>
          <Rating
            value={article.rating}
            text={`${article.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as='h3'>{article.prices}TND</Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Article;