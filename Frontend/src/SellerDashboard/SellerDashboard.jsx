import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import './SellerDashboard.css';

export default function SellerDashboard() {
    const [products, setProducts] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [auctionsLoading, setAuctionsLoading] = useState(true);
    const [error, setError] = useState("");
    const [auctionError, setAuctionError] = useState("");
    const [actionMessage, setActionMessage] = useState("");

    useEffect(() => {
        fetchProducts();
        fetchAuctions();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("You need to be logged in to view your products");
                setLoading(false);
                return;
            }
            const response = await fetch("http://127.0.0.1:8000/api/products/my/", {
                method: "GET",
                headers: {
                    "Authorization": `Token ${token}`
                }
            });
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            console.log("Fetched products:", data.products); // Debug output
            setProducts(data.products || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError("Failed to load products. Please try again later.");
            setLoading(false);
        }
    };

    const fetchAuctions = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setAuctionError("You need to be logged in to view your auctions");
                setAuctionsLoading(false);
                return;
            }
            
            const response = await axios.get("http://127.0.0.1:8000/api/auctions/my-auctions/", {
                headers: {
                    "Authorization": `Token ${token}`
                }
            });
            
            setAuctions(response.data.auctions || []);
            setAuctionsLoading(false);
        } catch (err) {
            console.error("Error fetching auctions:", err);
            setAuctionError("Failed to load auctions. Please try again later.");
            setAuctionsLoading(false);
        }
    };

    const closeAuction = async (auctionId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setActionMessage("You need to be logged in to close an auction");
                return;
            }
            
            const response = await axios.post(
                `http://127.0.0.1:8000/api/auctions/${auctionId}/close/`, 
                {},
                {
                    headers: {
                        "Authorization": `Token ${token}`
                    }
                }
            );
            
            setActionMessage(response.data.winner 
                ? `Auction closed successfully. Winner: ${response.data.winner}` 
                : "Auction closed with no winning bids");
            
            // Refresh the auctions list
            fetchAuctions();
            
            // Clear the message after 5 seconds
            setTimeout(() => {
                setActionMessage("");
            }, 5000);
            
        } catch (err) {
            console.error("Error closing auction:", err);
            setActionMessage(err.response?.data?.error || "Failed to close auction");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div className="seller-dashboard">
            {/* Products Section */}
            <section className="dashboard-section">
                <h1>Your Listed Products</h1>
                <Link to="/sellproducts" className="add-product-btn">+ Add New Product</Link>
                {loading ? (
                    <p>Loading your products...</p>
                ) : error ? (
                    <p className="error-message">{error}</p>
                ) : products.length === 0 ? (
                    <p className="no-products">You haven't listed any products yet.</p>
                ) : (
                    <div className="product-list">
                        {products.map((product) => {
                            const imageUrl = product.images && product.images.length > 0
                                ? product.images[0]
                                : "/placeholder-image.jpg";
                            console.log(`Product ${product.name} image:`, imageUrl); // Debug image URL
                            return (
                                <div key={product.id} className="product-card">
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="product-img"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder-image.jpg"; // Fallback if image fails
                                        }}
                                    />
                                    <div className="product-info">
                                        <h3>{product.name}</h3>
                                        <p>{product.price} Da</p>
                                        <span className="active">Active</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Auctions Section */}
            <section className="dashboard-section">
                <h1>Your Auctions</h1>
                <Link to="/create-auction" className="add-auction-btn">+ Create New Auction</Link>
                
                {actionMessage && (
                    <div className="action-message">
                        {actionMessage}
                    </div>
                )}
                
                {auctionsLoading ? (
                    <p>Loading your auctions...</p>
                ) : auctionError ? (
                    <p className="error-message">{auctionError}</p>
                ) : auctions.length === 0 ? (
                    <p className="no-auctions">You haven't created any auctions yet.</p>
                ) : (
                    <div className="auctions-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Current Bid</th>
                                    <th>Status</th>
                                    <th>End Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auctions.map((auction) => (
                                    <tr key={auction.id}>
                                        <td>{auction.product_name}</td>
                                        <td>{auction.current_bid} Da</td>
                                        <td>
                                            <div>
                                                <span className={`status status-${auction.status.toLowerCase()}`}>
                                                    {auction.status}
                                                </span>
                                                {auction.status.toLowerCase() === 'active' && (
                                                    <button 
                                                        className="close-btn auction-item-close"
                                                        onClick={() => {
                                                            if (window.confirm("Are you sure you want to close this auction?")) {
                                                                closeAuction(auction.id);
                                                            }
                                                        }}
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td>{formatDate(auction.end_date)}</td>
                                        <td>
                                            <div className="auction-actions">
                                                <Link to={`/auctions/${auction.id}`} className="view-btn">
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}