import { useState } from "react";
import './OrderTracking.css';

export default function OrderTracking() {
    const [orderId, setOrderId] = useState("");
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTrackOrder = async () => {
        if (!orderId) {
            setError("Please enter an order ID");
            return;
        }

        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please log in to track your order");
            setLoading(false);
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
                throw new Error(response.status === 404 ? "Order not found" : "Failed to fetch order details");
            }

            const data = await response.json();
            
            // Map backend data to our component's expected format
            const formattedOrder = {
                id: data.order.id,
                date: new Date(data.order.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                status: data.order.status,
                estimatedDelivery: data.order.status === 'delivered' ? 'Delivered' : 
                                  'Estimated delivery date not available',
                items: data.order.items.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: `$${item.price}`
                })),
                courier: "Shipping Service", // This might not be in your API
                trackingNumber: `ORD-${data.order.id}`, // This might not be in your API
                address: data.order.shipping_address,
                totalAmount: `$${data.order.total_amount}`
            };

            setOrderData(formattedOrder);
        } catch (err) {
            console.error("Error fetching order:", err);
            setError(err.message || "An error occurred while fetching your order");
        } finally {
            setLoading(false);
        }
    };

    // Map backend status to our progress bar steps
    const getStatusStep = (status) => {
        const statusMap = {
            'pending': 'Order Placed',
            'paid': 'Processing',
            'shipped': 'Shipped',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    };

    // Function to determine if a step is active
    const isStepActive = (step, orderStatus) => {
        const steps = ['Order Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
        const orderStep = getStatusStep(orderStatus);
        const orderStepIndex = steps.indexOf(orderStep);
        const currentStepIndex = steps.indexOf(step);
        
        return currentStepIndex <= orderStepIndex;
    };

    return (
        <div className="order-tracking">
            <h1>Track Your Order</h1>
            <div className="tracking-form">
                <input
                    type="text"
                    placeholder="Enter Order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="order-input"
                />
                <button onClick={handleTrackOrder} disabled={loading}>
                    {loading ? "Loading..." : "Track Order"}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {orderData && (
                <div className="order-details">
                    <h2>Order Summary</h2>
                    <p><strong>Order ID:</strong> {orderData.id}</p>
                    <p><strong>Order Date:</strong> {orderData.date}</p>
                    <p><strong>Total Amount:</strong> {orderData.totalAmount}</p>
                    <p><strong>Shipping Address:</strong> {orderData.address}</p>

                    <h2>Order Status</h2>
                    <div className="progress-bar">
                        <div className={`step ${isStepActive('Order Placed', orderData.status) ? "active" : ""}`}>Order Placed</div>
                        <div className={`step ${isStepActive('Processing', orderData.status) ? "active" : ""}`}>Processing</div>
                        <div className={`step ${isStepActive('Shipped', orderData.status) ? "active" : ""}`}>Shipped</div>
                        <div className={`step ${isStepActive('Out for Delivery', orderData.status) ? "active" : ""}`}>Out for Delivery</div>
                        <div className={`step ${isStepActive('Delivered', orderData.status) ? "active" : ""}`}>Delivered</div>
                    </div>

                    <h2>Items Ordered</h2>
                    <ul>
                        {orderData.items.map((item, index) => (
                            <li key={index}>{item.quantity}x {item.name} - {item.price}</li>
                        ))}
                    </ul>

                    <h2>Shipment Details</h2>
                    <p><strong>Status:</strong> {getStatusStep(orderData.status)}</p>
                    <p><strong>Tracking Number:</strong> {orderData.trackingNumber}</p>
                    
                    {/* Add invoice download button */}
                    <div className="invoice-section">
                        <h2>Invoice</h2>
                        <a 
                            href={`http://127.0.0.1:8000/api/orders/${orderData.id}/invoice/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="download-invoice-btn"
                        >
                            Download Invoice
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
