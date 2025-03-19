import { faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import "./ReviewForm.css";
export default function ReviewForm({ onClose }) {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [recommend, setRecommend] = useState(false);

    return(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>✖</button>
                <h2>Write a review</h2>

                {/* Star Rating */}
                <p>Overall rating</p>
                <div className="star-rating">
                    {[...Array(5)].map((_, index) => {
                        const starValue = index + 1;
                        return (
                            <FontAwesomeIcon
                                key={index}
                                icon={faStar}
                                className={`star ${starValue <= (hover || rating) ? "filled" : ""}`}
                                onMouseEnter={() => setHover(starValue)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(starValue)}
                            />
                        );
                    })}
                </div>

                {/* Review Form */}
                <label>Review title</label>
                <input type="text" placeholder="Enter title" />

                <label>Review</label>
                <textarea placeholder="Write your review here..."></textarea>

                {/* Recommendation */}
                <p>Would you recommend this product?</p>
                <div className="recommend-options">
                    <button className={recommend === true ? "active" : ""} onClick={() => setRecommend(true)}>Yes</button>
                    <button className={recommend === false ? "active" : ""} onClick={() => setRecommend(false)}>No</button>
                </div>

                {/* Name & Email */}
                <label>Name</label>
                <input type="text" placeholder="Enter your name" />

                <label>Email</label>
                <input type="email" placeholder="Enter your email" />

                {/* Submit Button */}
                <button className="submit-btn">Submit</button>
            </div>
        </div>
    )
}