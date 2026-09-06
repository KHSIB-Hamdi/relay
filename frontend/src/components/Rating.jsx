import React from 'react'
import PropTypes from 'prop-types'
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const Rating = ({ value, text, color }) => {
  const starIcons = [1, 2, 3, 4, 5].map((index) => (
    <span key={index}>
      <i>
      {value >= index ? (
        <FaStar style={{ color }} />
      ) : value >= index - 0.5 ? (
        <FaStarHalfAlt style={{ color }} />
      ) : (
        <FaStar style={{ color: '#ccc' }} />
      )}
      </i>
    </span>
    
  ));

  return (
    <div  className="rating" style={{ display: 'flex' }}>
      {starIcons}
      <span>{text && text}</span>
    </div>
  );
}

Rating.defaultProps = {
  color: '#f8e825',
}

Rating.propTypes = {
  value: PropTypes.number,
  text: PropTypes.string,
  color: PropTypes.string,
}

export default Rating;