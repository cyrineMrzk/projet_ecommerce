import { faCartShopping, faHeart, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dumbell from "../images/dumbell.jpg";
import './ProductCard.css';
import { Link } from "react-router-dom";
export default function ProductCard({ product ,imgsrc}) {
    return (
        <div className="product-card">
            <Link to='/products/product' className="link">
            <img src={dumbell} alt={product.name} />
            <div className="product-info">
                <h2>{product.name}</h2>
                <span className="product-type">{product.type}</span>
                <span className="product-rating"><FontAwesomeIcon icon={faStar} style={{color: "#000000",}} /> {product.rating}</span>
                <span className="price">{product.price} Da</span>
            </div>
           
            <div className="product-actions">
                <button className="cart-btn"><FontAwesomeIcon icon={faCartShopping} /> Add to Cart</button>
                <button className="fav-btn"><FontAwesomeIcon icon={faHeart} /> Favorite</button>
            </div>
            </Link>
        </div>
    )
}