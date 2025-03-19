import { useState } from "react";
import { Link } from "react-router-dom";
import './SellerDashboard.css'
export default function SellerDashboard(){
    const [products, setProducts] = useState([
        {
            id: 1,
            name: "Dumbbells Set",
            price: "5000 Da",
            images: ["/images/dumbbells.jpg"],
            status: "Active"
        },
        {
            id: 2,
            name: "Protein Powder",
            price: "3000 Da",
            images: ["/images/protein.jpg"],
            status: "Sold"
        }
    ]);

    return(
<div className="seller-dashboard">
            <h1>Your Listed Products</h1>
            <button className="add-product-btn">
                <Link to="/sellproducts">+ Add New Product</Link>
            </button>
            
            {products.length === 0 ? (
                <p className="no-products">You haven't listed any products yet.</p>
            ) : (
                <div className="product-list">
                    {products.map((product) => (
                        <div key={product.id} className="product-card">
                            <img src={product.images[0]} alt={product.name} className="product-img" />
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p>{product.price}</p>
                                <span className={product.status === "Sold" ? "sold" : "active"}>{product.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}