import { useState } from "react";
import './OrderTracking.css';

export default function OrderTracking(){
    const [orderId, setOrderId] = useState("");
    const [orderData, setOrderData] = useState(null);

    const handleTrackOrder = () => {
        // Mock order data (replace with API call)
        const mockOrder = {
          id: "123456789",
          date: "March 15, 2025",
          status: "Shipped",
          estimatedDelivery: "March 20, 2025",
          items: [
            { name: "Nike Air Max 90", quantity: 1, price: "$120" },
            { name: "Adidas Training Shirt", quantity: 2, price: "$50" },
          ],
          courier: "DHL Express",
          trackingNumber: "DH123456789",
          address: "123 Main Street, London, UK",
        };
        setOrderData(mockOrder);
      };
    return(
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
          <button onClick={handleTrackOrder}>Track Order</button>
        </div>
  
        {orderData && (
          <div className="order-details">
            <h2>Order Summary</h2>
            <p><strong>Order ID:</strong> {orderData.id}</p>
            <p><strong>Order Date:</strong> {orderData.date}</p>
            <p><strong>Estimated Delivery:</strong> {orderData.estimatedDelivery}</p>
            <p><strong>Shipping Address:</strong> {orderData.address}</p>
            
            <h2>Order Status</h2>
            <div className="progress-bar">
              <div className={`step ${orderData.status === "Order Placed" ? "active" : ""}`}>Order Placed</div>
              <div className={`step ${orderData.status === "Processing" ? "active" : ""}`}>Processing</div>
              <div className={`step ${orderData.status === "Shipped" ? "active" : ""}`}>Shipped</div>
              <div className={`step ${orderData.status === "Out for Delivery" ? "active" : ""}`}>Out for Delivery</div>
              <div className={`step ${orderData.status === "Delivered" ? "active" : ""}`}>Delivered</div>
            </div>
            
            <h2>Items Ordered</h2>
            <ul>
              {orderData.items.map((item, index) => (
                <li key={index}>{item.quantity}x {item.name} - {item.price}</li>
              ))}
            </ul>
            
            <h2>Shipment Details</h2>
            <p><strong>Courier:</strong> {orderData.courier}</p>
            <p><strong>Tracking Number:</strong> <a href="#">{orderData.trackingNumber}</a></p>
          </div>
        )}
      </div>
    )
}