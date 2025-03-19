import './SellProducts.css';
import { useState } from "react";

export default function SellProducts() {
    const [product, setProduct] = useState({
        name: "",
        description: "",
        category: "",
        price: "",
        saleType: "sell",
        auctionStartPrice: "",
        auctionDuration: "",
        images: []
    });

    const [errors, setErrors] = useState({
        images: "",
        category: ""
    });

    const [successMessage, setSuccessMessage] = useState("");

    const categories = ["Gym equipement", "Cardio & Endurance", "Supplements", "Accessoires"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });

        if (name === "category" && value) {
            setErrors({ ...errors, category: "" });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = [...product.images, ...files];

        if (newImages.length < 3) {
            setErrors({ ...errors, images: "Please upload at least 3 images." });
        } else {
            setErrors({ ...errors, images: "" });
        }

        setProduct({ ...product, images: newImages });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let newErrors = { images: "", category: "" };

        if (product.images.length < 3) {
            newErrors.images = "Please upload at least 3 images.";
        }
        if (!product.category) {
            newErrors.category = "Please select a category.";
        }

        setErrors(newErrors);

        if (newErrors.images || newErrors.category) {
            return;
        }

        console.log("Product Submitted:", product);
        setSuccessMessage("Product listed successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);

        setProduct({
            name: "",
            description: "",
            category: "",
            price: "",
            saleType: "sell",
            auctionStartPrice: "",
            auctionDuration: "",
            images: []
        });
    };

    return (
        <div className="sell-product">
            <h1>List Your Product</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            <form onSubmit={handleSubmit}>
                <label>Product Name</label>
                <input type="text" name="name" value={product.name} onChange={handleChange} required />

                <label>Description</label>
                <textarea name="description" value={product.description} onChange={handleChange} required></textarea>

                <label>Choose Category</label>
                <select name="category" value={product.category} onChange={handleChange} required>
                    <option value="">Select a category</option>
                    {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                    ))}
                </select>
                {errors.category && <p className="error-message">{errors.category}</p>}

                <label>Choose Sale Type</label>
                <div className="sale-options">
                    <label>
                        <input type="radio" name="saleType" value="sell" checked={product.saleType === "sell"} onChange={handleChange} />
                        Sell Now
                    </label>
                    <label>
                        <input type="radio" name="saleType" value="auction" checked={product.saleType === "auction"} onChange={handleChange} />
                        Auction
                    </label>
                </div>

                {product.saleType === "sell" && (
                    <>
                        <label>Price (Da)</label>
                        <input type="number" name="price" value={product.price} onChange={handleChange} required />
                    </>
                )}

                {product.saleType === "auction" && (
                    <>
                        <label>Starting Bid (Da)</label>
                        <input type="number" name="auctionStartPrice" value={product.auctionStartPrice} onChange={handleChange} required />

                        <label>Auction Duration (Days)</label>
                        <input type="number" name="auctionDuration" value={product.auctionDuration} onChange={handleChange} required />
                    </>
                )}

                <label>Upload Images (Min: 3)</label>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                {errors.images && <p className="error-message">{errors.images}</p>}

                <button type="submit">List Product</button>
            </form>

            {product.images.length > 0 && (
                <div className="image-preview">
                    <h3>Uploaded Images</h3>
                    <div className="image-grid">
                        {product.images.map((file, index) => (
                            <img key={index} src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}