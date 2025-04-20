import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processingOrder, setProcessingOrder] = useState(false);

    // Form state
    const [shippingAddress, setShippingAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // Fetch cart data when component mounts
    useEffect(() => {
        const fetchCart = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                navigate('/login', { state: { redirectTo: '/checkout' } });
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
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data.items || data.items.length === 0) {
                    navigate('/cart', { state: { message: 'Your cart is empty. Add some products before checkout.' } });
                    return;
                }
                
                setCartItems(data.items || []);
                setCartTotal(data.total_amount || 0);
            } catch (err) {
                console.error("Error fetching cart:", err);
                setError("Failed to load your cart. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [navigate]);

    const validateForm = () => {
        const errors = {};
        
        if (!shippingAddress.trim()) {
            errors.shippingAddress = "Shipping address is required";
        }
        
        if (!phoneNumber.trim()) {
            errors.phoneNumber = "Phone number is required";
        } else if (!/^\d{10,}$/.test(phoneNumber.replace(/[^0-9]/g, ''))) {
            errors.phoneNumber = "Please enter a valid phone number";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setProcessingOrder(true);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/checkout/', {
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
            
            if (!response.ok) {
                throw new Error(data.error || "Failed to process your order");
            }
            
            // Redirect to order confirmation page
            navigate(`/order-confirmation/${data.order_id}`, { 
                state: { 
                    orderDetails: {
                        orderId: data.order_id,
                        totalAmount: data.total_amount
                    }
                }
            });
            
        } catch (err) {
            console.error("Checkout error:", err);
            setError(err.message);
            window.scrollTo(0, 0); // Scroll to top to show error
        } finally {
            setProcessingOrder(false);
        }
    };

    if (loading) {
        return <div className="checkout-loading">Loading checkout information...</div>;
    }

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>
            
            {error && (
                <div className="checkout-error">
                    {error}
                </div>
            )}
            
            <div className="checkout-content">
                <div className="checkout-form-container">
                    <h2>Shipping Information</h2>
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-group">
                            <label htmlFor="shipping-address">Shipping Address</label>
                            <textarea 
                                id="shipping-address"
                                value={shippingAddress}
                                onChange={(e) => setShippingAddress(e.target.value)}
                                placeholder="Enter your full shipping address"
                                rows={4}
                                className={formErrors.shippingAddress ? "error" : ""}
                            />
                            {formErrors.shippingAddress && (
                                <div className="error-message">{formErrors.shippingAddress}</div>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="phone-number">Phone Number</label>
                            <input 
                                type="tel"
                                id="phone-number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="Enter your phone number"
                                className={formErrors.phoneNumber ? "error" : ""}
                            />
                            {formErrors.phoneNumber && (
                                <div className="error-message">{formErrors.phoneNumber}</div>
                            )}
                        </div>
                        
                        <button 
                            type="submit" 
                            className="checkout-button"
                            disabled={processingOrder}
                        >
                            {processingOrder ? "Processing..." : "Place Order"}
                        </button>
                    </form>
                </div>
                
                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <div className="cart-items-summary">
                        {cartItems.map((item) => (
                            <div className="summary-item" key={item.id}>
                                <div className="summary-item-image">
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} />
                                    ) : (
                                        <div className="no-image">No Image</div>
                                    )}
                                </div>
                                <div className="summary-item-details">
                                    <div className="summary-item-name">{item.name}</div>
                                    <div className="summary-item-meta">
                                        {item.quantity} × ${item.price} | {item.color} | Size: {item.size}
                                    </div>
                                </div>
                                <div className="summary-item-price">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="order-totals">
                        <div className="subtotal">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="shipping">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="total">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}