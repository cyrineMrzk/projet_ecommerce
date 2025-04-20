import { useState, useEffect } from 'react';
import './OrdersDashboard.css';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                setError("Please log in to view your orders");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/orders/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();
                setOrders(data.orders || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("Failed to load orders. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setCurrentPage(1);
    };

    const handleSortChange = (e) => {
        setSortBy(e.target.value);
    };

    const toggleSortDirection = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getImageSource = (item) => {
        if (item.image?.startsWith('http')) {
            return item.image;
        }
        if (item.image) {
            return `http://127.0.0.1:8000${item.image.startsWith('/media') ? '' : '/media/'}${item.image}`;
        }
        return '/fallback-image.jpg';
    };

    const getFilteredAndSortedOrders = () => {
        let filteredOrders = [...orders];

        if (filter !== 'all') {
            filteredOrders = filteredOrders.filter(order => order.status === filter);
        }

        filteredOrders.sort((a, b) => {
            if (sortBy === 'date') {
                return sortDirection === 'asc' 
                    ? new Date(a.created_at) - new Date(b.created_at)
                    : new Date(b.created_at) - new Date(a.created_at);
            } else if (sortBy === 'total') {
                return sortDirection === 'asc'
                    ? a.total_amount - b.total_amount
                    : b.total_amount - a.total_amount;
            }
            return 0;
        });

        return filteredOrders;
    };

    const filteredAndSortedOrders = getFilteredAndSortedOrders();
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredAndSortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order?")) {
            return;
        }

        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/cancel/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || `Failed to cancel order: ${response.status}`);
            }

            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, status: 'cancelled' }
                    : order
            ));

            alert("Order cancelled successfully");
        } catch (err) {
            console.error("Error cancelling order:", err);
            alert(err.message);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'pending': return 'status-badge pending';
            case 'paid': return 'status-badge paid';
            case 'processing': return 'status-badge processing';
            case 'shipped': return 'status-badge shipped';
            case 'delivered': return 'status-badge delivered';
            case 'cancelled': return 'status-badge cancelled';
            default: return 'status-badge';
        }
    };

    if (loading) {
        return <div className="order-management-loading">Loading your orders...</div>;
    }

    if (error) {
        return <div className="order-management-error">{error}</div>;
    }

    return (
        <div className="order-management">
            <h1>My Orders</h1>

            <div className="order-controls">
                <div className="filter-container">
                    <label htmlFor="status-filter">Filter by Status:</label>
                    <select id="status-filter" value={filter} onChange={handleFilterChange}>
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <div className="sort-container">
                    <label htmlFor="sort-by">Sort by:</label>
                    <select id="sort-by" value={sortBy} onChange={handleSortChange}>
                        <option value="date">Date</option>
                        <option value="total">Total Amount</option>
                    </select>
                    <button className="sort-direction" onClick={toggleSortDirection}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <p>You haven't placed any orders yet.</p>
                    <a href="/products" className="shop-now-button">Shop Now</a>
                </div>
            ) : (
                <>
                    <div className="orders-count">
                        Showing {currentOrders.length} of {filteredAndSortedOrders.length} orders
                    </div>

                    <div className="orders-list">
                        {currentOrders.map(order => (
                            <div className="order-card" key={order.id}>
                                <div className="order-header">
                                    <div className="order-id">
                                        <h3>Order #{order.id}</h3>
                                        <span className="order-date">{formatDate(order.created_at)}</span>
                                    </div>
                                    <div className={getStatusBadgeClass(order.status)}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </div>
                                </div>

                                <div className="order-items-preview">
                                    {order.items.slice(0, 2).map(item => (
                                        <div className="order-item" key={item.id}>
                                            <div className="item-image">
                                                {item.image ? (
                                                    <img src={getImageSource(item)} alt={item.name} />
                                                ) : (
                                                    <div className="no-image">No Image</div>
                                                )}
                                            </div>
                                            <div className="item-details">
                                                <div className="item-name">{item.name}</div>
                                                <div className="item-meta">
                                                    {item.quantity} × ${item.price} | {item.color} | Size: {item.size}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {order.items.length > 2 && (
                                        <div className="more-items">
                                            +{order.items.length - 2} more items
                                        </div>
                                    )}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        <span>Total:</span>
                                        <span className="total-amount">${order.total_amount.toFixed(2)}</span>
                                    </div>

                                    <div className="order-actions">
                                        <a href={`/order-tracking?order_id=${order.id}`} className="view-details-btn">Track Order</a>
                                        <a href={`http://127.0.0.1:8000/api/orders/${order.id}/invoice/`} target="_blank" rel="noopener noreferrer" className="invoice-btn">Invoice</a>

                                        {order.status === 'pending' && (
                                            <button className="cancel-order-btn" onClick={() => handleCancelOrder(order.id)}>Cancel</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredAndSortedOrders.length > ordersPerPage && (
                        <div className="pagination">
                            <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} className="page-btn">Previous</button>

                            {Array.from({ length: Math.ceil(filteredAndSortedOrders.length / ordersPerPage) }, (_, i) => (
                                <button key={i} onClick={() => paginate(i + 1)} className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}>{i + 1}</button>
                            ))}

                            <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredAndSortedOrders.length / ordersPerPage)} className="page-btn">Next</button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
