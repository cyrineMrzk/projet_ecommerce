import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Order details might be passed from the checkout page
    // If not, we need to fetch them
    useEffect(() => {
        const fetchOrderDetails = async () => {
            // If we already have order details from state, use those
            if (location.state?.orderDetails) {
                setOrderDetails(location.state.orderDetails);
                setLoading(false);
                return;
            }
            
            // Otherwise fetch from API
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }
                
                const data = await response.json();
                setOrderDetails({
                    orderId: data.order.id,
                    totalAmount: data.order.total_amount
                });
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Could not load order details. Please check your order history.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchOrderDetails();
    }, [orderId, location.state, navigate]);
    
    if (loading) {
        return <div className="confirmation-loading">Loading order information...</div>;
    }
    
    if (error) {
        return <div className="confirmation-error">{error}</div>;
    }
    
    return (
        <div className="order-confirmation">
            <div className="confirmation-card">
                <div className="confirmation-header">
                    <div className="check-mark">✓</div>
                    <h1>Order Confirmed!</h1>
                    <p>Thank you for your purchase</p>
                </div>
                
                <div className="confirmation-details">
                    <div className="detail-row">
                        <span>Order Number:</span>
                        <span>#{orderDetails.orderId}</span>
                    </div>
                    <div className="detail-row">
                        <span>Total Amount:</span>
                        <span>${orderDetails.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
                
                <div className="confirmation-message">
                    <p>We've received your order and we're getting it ready. A confirmation email has been sent to your registered email address.</p>
                </div>
                
                <div className="confirmation-actions">
                    <a 
                        href={`/order-tracking?order_id=${orderDetails.orderId}`} 
                        className="track-order-btn"
                    >
                        Track Your Order
                    </a>
                    
                    <a 
                        href={`http://127.0.0.1:8000/api/orders/${orderDetails.orderId}/invoice/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="invoice-btn"
                    >
                        Download Invoice
                    </a>
                </div>
                
                <div className="continue-shopping">
                    <a href="/products" className="continue-shopping-btn">Continue Shopping</a>
                </div>
            </div>
        </div>
    );
}