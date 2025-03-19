import { useState } from 'react';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import'./reviews.css';
import ReviewForm from './ReviewForm';
export default function Reviews() {
    const [showModal, setShowModal] = useState(false);
    const reviews = [
        {
            id: 1,
            title: "Great product",
            content: "I bought this product and I really like it ...",
            user: "Mohamed",
            date: "04-03-2025",
            recommends: true,
        },
        {
            id: 2,
            title: "Great product",
            content: "I bought this product and I really like it ...",
            user: "Mohamed",
            date: "14-03-2024",
            recommends: true,
        },
    ];
    return (
        <div className="reviews-section">
            <h2 className="title">Reviews</h2>
            <div className='review-summary'>
                <div className='stars'>
                    {[...Array(5)].map((_, index) => (
                         <FontAwesomeIcon icon={faStar} key={index} className='star-icon' />
                    ))}
                    <span className='rating'>5.0</span>
                    <span className='total-reviews'>| {reviews.length} reviews</span>
                    </div>
                <p>
                    {reviews.length} out of {reviews.length} (100%) people recommends this product
                </p>
                </div>
                <button className='write-review-btn' onClick={()=>setShowModal(true)}>Write a review</button>
                <div className='review-list'>
                    {reviews.map((review) => (
                         <div key={review.id} className="review">
                         <hr />
                         <h3>{review.title}</h3>
                         <p className="review-content">{review.content}</p>
                         <span className="review-user">{review.user} | {review.date}</span>
                         <span className="recommend">
                             Recommends this product ✓ {review.recommends ? "Yes" : "No"}
                         </span>
                     </div>
                    ))}

                </div>
             {showModal && <ReviewForm onClose={()=>setShowModal(false)} />}  
        </div>
    );
}