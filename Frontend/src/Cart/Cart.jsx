import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faShoppingCart, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import './Cart.css';
import dumbell from "../images/dumbell.jpg";

export default function Cart() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [totalPrice, setTotalPrice] = useState(0);
    
    // Checkout modal state
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCartItems();
    }, []);

    useEffect(() => {
        // Calculate total price whenever cart items change
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setTotalPrice(total);
    }, [cartItems]);

    const fetchCartItems = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Please login to view your cart');
            setLoading(false);
            return;
        }
    
        try {
            const response = await fetch('http://127.0.0.1:8000/api/cart/', {
                method: 'GET',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch cart items');
            }
    
            const data = await response.json();
            
            // Transform the data to match frontend expectations
            const transformedItems = data.items.map(item => ({
                id: item.id,
                product_id: item.product.id,
                name: item.product.name,
                brand: item.product.brand,
                price: item.product.price,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
                // Take the first image if available
                image: item.product.images.length > 0 ? item.product.images[0] : null,
                subtotal: item.subtotal
            }));
            
            setCartItems(transformedItems);
        } catch (err) {
            console.error('Error fetching cart items:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromCart = async (cartItemId) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/cart/remove/${cartItemId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove item from cart');
            }

            setCartItems(cartItems.filter(item => item.id !== cartItemId));
            setSuccessMessage('Item removed from cart');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error removing item from cart:', err);
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleUpdateQuantity = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/cart/update/${cartItemId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    quantity: newQuantity
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }

            setCartItems(cartItems.map(item => 
                item.id === cartItemId ? {...item, quantity: newQuantity} : item
            ));
        } catch (err) {
            console.error('Error updating quantity:', err);
            setError(err.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleBuyNow = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Please login to checkout');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (cartItems.length === 0) {
            setError('Your cart is empty');
            setTimeout(() => setError(null), 3000);
            return;
        }

        // Open checkout modal
        setShowCheckoutModal(true);
    };

    // Handle checkout form input change
    const handleCheckoutInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'shippingAddress') {
            setShippingAddress(value);
        } else if (name === 'phoneNumber') {
            setPhoneNumber(value);
        }
        
        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };

    // Validate checkout form
    const validateCheckoutForm = () => {
        let errors = {};
        let isValid = true;
        
        if (!shippingAddress.trim()) {
            errors.shippingAddress = 'Shipping address is required';
            isValid = false;
        }
        
        if (!phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
            isValid = false;
        } else if (!/^[0-9+\s()-]{8,15}$/.test(phoneNumber.trim())) {
            errors.phoneNumber = 'Please enter a valid phone number';
            isValid = false;
        }
        
        setFormErrors(errors);
        return isValid;
    };

    // Submit order for all cart items
    const submitOrder = async () => {
        if (!validateCheckoutForm()) {
            return;
        }
        
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/orders/create-from-cart/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    shipping_address: shippingAddress,
                    phone_number: phoneNumber
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setShowCheckoutModal(false);
                setCartItems([]);
                setSuccessMessage('Order placed successfully!');
                setTimeout(() => setSuccessMessage(''), 3000);
                
                // Offer to download the invoice
                if (data.invoice_url) {
                    const downloadInvoice = window.confirm('Would you like to download your invoice?');
                    if (downloadInvoice) {
                        window.open(data.invoice_url, '_blank');
                    }
                }
                
                // Redirect to orders page
                setTimeout(() => {
                    window.location.href = '/orders';
                }, 2000);
            } else {
                setError(data.error || 'Failed to place order.');
                setTimeout(() => setError(null), 3000);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setError('An error occurred while placing your order.');
            setTimeout(() => setError(null), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return dumbell;
        if (imagePath.startsWith('http')) return imagePath;
        if (typeof imagePath === 'string') {
            return `http://127.0.0.1:8000${imagePath}`;
        }
        // Handle case where imagePath might be an object with url property
        if (imagePath.url) {
            return imagePath.url.startsWith('http') ? imagePath.url : `http://127.0.0.1:8000${imagePath.url}`;
        }
        return dumbell;
    };
    return (
        <div className="cart-container">
            <h2>Your Shopping Cart</h2>
            
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <FontAwesomeIcon icon={faShoppingCart} size="3x" className="empty-icon" />
                    <p>Your cart is empty</p>
                    <Link to="/products" className="browse-products-btn">Browse Products</Link>
                </div>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div className="cart-item" key={item.id}>
                                <div className="cart-item-image">
                                    <img 
                                        src={getImageUrl(item.image)} 
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.src = dumbell;
                                        }}
                                    />
                                </div>
                                <div className="cart-item-details">
                                    <Link 
                                        to={`/products/${item.product_id}`}
                                        className="product-link"
                                    >
                                        <h3>{item.name}</h3>
                                    </Link>
                                    <p className="brand">{item.brand}</p>
                                    <p className="price">{item.price} DA</p>
                                    
                                    {item.color && <p className="item-color">Color: {item.color}</p>}
                                    {item.size && <p className="item-size">Size: {item.size}</p>}
                                    
                                    <div className="quantity-control">
                                        <button 
                                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                                            +
                                        </button>
                                    </div>
                                    
                                    <p className="item-total">Total: {item.price * item.quantity} DA</p>
                                    
                                    <button 
                                        className="remove-item-btn"
                                        onClick={() => handleRemoveFromCart(item.id)}
                                        title="Remove from cart"
                                    >
                                        <FontAwesomeIcon icon={faTrash} /> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        <div className="summary-row">
                            <span>Items ({cartItems.length}):</span>
                            <span>{totalPrice} DA</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping:</span>
                            <span>Free</span>
                        </div>
                        <div className="summary-total">
                            <span>Total:</span>
                            <span>{totalPrice} DA</span>
                        </div>
                        <button className="checkout-btn" onClick={handleBuyNow}>
                            Checkout <FontAwesomeIcon icon={faArrowRight} />
                        </button>
                        <Link to="/products" className="continue-shopping-btn">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            )}
            
            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="checkout-modal-overlay">
                    <div className="checkout-modal">
                        <div className="checkout-modal-header">
                            <h3>Complete Your Purchase</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowCheckoutModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="checkout-modal-body">
                            <div className="checkout-summary">
                                <h4>Order Summary</h4>
                                <p>Items: {cartItems.length}</p>
                                <p className="checkout-total">Total: {totalPrice} DA</p>
                            </div>
                            
                            <form className="checkout-form">
                                <div className="form-group">
                                    <label htmlFor="shippingAddress">Shipping Address</label>
                                    <textarea
                                        id="shippingAddress"
                                        name="shippingAddress"
                                        value={shippingAddress}
                                        onChange={handleCheckoutInputChange}
                                        placeholder="Enter your full shipping address"
                                        rows={3}
                                    />
                                    {formErrors.shippingAddress && (
                                        <span className="error-message">{formErrors.shippingAddress}</span>
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={phoneNumber}
                                        onChange={handleCheckoutInputChange}
                                        placeholder="Enter your phone number"
                                    />
                                    {formErrors.phoneNumber && (
                                        <span className="error-message">{formErrors.phoneNumber}</span>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="checkout-modal-footer">
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowCheckoutModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="place-order-btn"
                                onClick={submitOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
