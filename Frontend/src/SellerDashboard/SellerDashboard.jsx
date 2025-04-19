import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import './SellerDashboard.css';
export default function SellerDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
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
                console.log("Fetched products:", data.products); // 👈 Debug output
                setProducts(data.products || []);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load products. Please try again later.");
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="seller-dashboard">
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

                        console.log(`Product ${product.name} image:`, imageUrl); // 👈 Debug image URL

                        return (
                            <div key={product.id} className="product-card">
                                <img
                                    src={imageUrl}
                                    alt={product.name}
                                    className="product-img"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-image.jpg"; // 👈 Fallback if image fails
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
        </div>
    );
}
