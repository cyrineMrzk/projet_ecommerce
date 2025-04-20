import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faTrash, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Favorites.css';
import dumbell from "../images/dumbell.jpg";

export default function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Please login to view your favorites');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/favorites/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch favorites');
            }

            const data = await response.json();
            setFavorites(data.favorites || []);
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (productId) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/favorites/remove/${productId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove favorite');
            }

            setFavorites(favorites.filter(item => item.product_id !== productId));
            setSuccessMessage('Product removed from favorites');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error removing favorite:', err);
            setError(err.message);
        }
    };

    const handleAddToCart = async (productId) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Please login to add items to cart');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:8000/api/cart/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to add to cart');
            }

            setSuccessMessage('Product added to cart!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError(err.message);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return dumbell;
        if (imagePath.startsWith('http')) return imagePath;
        return `http://127.0.0.1:8000${imagePath}`;
    };

    if (loading) {
        return (
            <div className="favorites-container">
                <h2>Your Favorites</h2>
                <div className="loading-message">Loading your favorite items...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="favorites-container">
                <h2>Your Favorites</h2>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="favorites-container">
            <h2>Your Favorites</h2>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {favorites.length === 0 ? (
                <div className="empty-favorites">
                    <FontAwesomeIcon icon={faHeart} size="3x" className="empty-icon" />
                    <p>You haven't added any favorites yet</p>
                    <Link to="/products" className="browse-products-btn">Browse Products</Link>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favorites.map((item) => (
                        <div className="favorite-item" key={item.id}>
                            <Link 
                                to={`/products/${item.product_id}`} 
                                state={{ product: item }}
                                className="favorite-image-link"
                            >
                                <div className="favorite-image">
                                    <img 
                                        src={getImageUrl(item.image)} 
                                        alt={item.name} 
                                        onError={(e) => {
                                            e.target.src = dumbell;
                                        }}
                                    />
                                </div>
                            </Link>
                            <button 
                                className="remove-favorite-btn"
                                onClick={() => handleRemoveFavorite(item.product_id)}
                                title="Remove from favorites"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <div className="favorite-details">
                                <Link 
                                    to={`/products/${item.product_id}`} 
                                    state={{ product: item }}
                                    className="product-link"
                                >
                                    <h3>{item.name}</h3>
                                </Link>
                                <p className="brand">{item.brand}</p>
                                <p className="price">{item.price} DA</p>
                                <div className="favorite-actions">
                                    <button 
                                        className="add-to-cart-btn"
                                        onClick={() => handleAddToCart(item.product_id)}
                                    >
                                        <FontAwesomeIcon icon={faShoppingCart} /> Add to Cart
                                    </button>
                                    <Link 
                                        to={`/products/${item.product_id}`} 
                                        state={{ product: item }}
                                        className="view-product-btn"
                                    >
                                        View Product
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}