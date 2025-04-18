import { faCartShopping, faHeart, faStar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dumbell from "../images/dumbell.jpg";
import './ProductCard.css';
import { Link } from "react-router-dom";

export default function ProductCard({ product, imgsrc }) {
    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        console.log('JWT token:', token);

        if (!token) {
            alert('Please log in to add to cart.');
            return;
        }

        console.log('Sending request with product:', product);

        try {
            const res = await fetch('http://127.0.0.1:8000/api/cart/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: 1,
                    color: product.colors?.[0] || 'Black',
                    size: product.sizes?.[0] || 'M'
                })
            });

            console.log('Response status:', res.status);
            const data = await res.json();
            console.log('Response data:', data);

            if (res.ok) {
                alert('Product added to cart successfully!');
            } else {
                alert(data.error || 'Failed to add product to cart.');
            }
        } catch (error) {
            console.error('Error details:', error);
            alert('An error occurred while adding to cart.');
        }
    };

    const getImageSource = () => {
        if (!imgsrc) return dumbell;
        try {
            return require(`../images/${imgsrc}`);
        } catch (error) {
            console.error(`Failed to load image: ${imgsrc}`, error);
            return dumbell;
        }
    };

    return (
        <div className="product-card">
            <Link to={`/products/${product.id}`} className="link">
                <img src={getImageSource()} alt={product.name} />
                <div className="product-info">
                    <h2>{product.name}</h2>
                    <span className="product-type">{product.type}</span>
                    <span className="product-rating">
                        <FontAwesomeIcon icon={faStar} style={{ color: "#000000" }} /> {product.rating}
                    </span>
                    <span className="price">{product.price} Da</span>
                </div>
            </Link>
            <div className="product-actions">
                <button className="cart-btn" onClick={handleAddToCart}>
                    <FontAwesomeIcon icon={faCartShopping} /> Add to Cart
                </button>
                <button className="fav-btn">
                    <FontAwesomeIcon icon={faHeart} /> Favorite
                </button>
            </div>
        </div>
    );
}
