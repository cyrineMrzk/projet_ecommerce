import './SellProducts.css';
import { useState, useEffect } from "react";  // Add useEffect here
import { useNavigate } from "react-router-dom";

export default function SellProducts() {
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: "",
        brand: "",
        sex: "unisex",
        colors: [],
        sizes: [],
        description: "",
        category: "",
        price: "",
        saleType: "SellNow",
        images: []
    });

    const [errors, setErrors] = useState({
        images: "",
        category: ""
    });

    const [successMessage, setSuccessMessage] = useState("");
    
    // Check if user is logged in
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { message: "Please login to list products" } });
        }
    }, [navigate]);
    
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

        if (newImages.length < 1) {
            setErrors({ ...errors, images: "Please upload at least 1 image." });
        } else {
            setErrors({ ...errors, images: "" });
        }

        setProduct({ ...product, images: newImages });
    };

    const handleListSubmit = async (e) => {
        e.preventDefault();

        let newErrors = { images: "", category: "" };

        if (product.images.length < 1) {
            newErrors.images = "Please upload at least 1 image.";
        }
        if (!product.category) {
            newErrors.category = "Please select a category.";
        }

        setErrors(newErrors);

        if (newErrors.images || newErrors.category) {
            return;
        }

        const formData = new FormData();
        formData.append("name", product.name);
        formData.append("brand", product.brand);
        formData.append("sex", product.sex);
        formData.append("colors", JSON.stringify(product.colors));
        formData.append("sizes", JSON.stringify(product.sizes));
        formData.append("description", product.description);
        formData.append("category", product.category);
        formData.append("sale_type", product.saleType);
        formData.append("price", product.price);
        formData.append("image", product.images[0]);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/api/products/", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}` // Add this line
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error("Failed to upload product.");
            }

            setSuccessMessage("Product listed successfully!");
            setTimeout(() => setSuccessMessage(""), 3000);

            setProduct({
                name: "",
                brand: "",
                sex: "unisex",
                colors: [],
                sizes: [],
                description: "",
                category: "",
                price: "",
                saleType: "SellNow",
                images: []
            });
        } catch (error) {
            console.error("Error uploading product:", error);
        }
    };

    return (
        <div className="sell-product">
            <h1>List Your Product</h1>
            {successMessage && <p className="success-message">{successMessage}</p>}
            <form onSubmit={handleListSubmit}>
                <label>Product Name</label>
                <input type="text" name="name" value={product.name} onChange={handleChange} required />

                <label>Brand</label>
                <input type="text" name="brand" value={product.brand} onChange={handleChange} required />

                <label>Sex</label>
                <select name="sex" value={product.sex} onChange={handleChange} required>
                    <option value="unisex">Unisex</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                </select>

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
                        <input type="radio" name="saleType" value="SellNow" checked={product.saleType === "SellNow"} onChange={handleChange} />
                        Sell Now
                    </label>
                    <label>
                        <input type="radio" name="saleType" value="Auction" checked={product.saleType === "Auction"} onChange={handleChange} />
                        Auction
                    </label>
                </div>

                <label>Price (Da)</label>
                <input type="number" name="price" value={product.price} onChange={handleChange} required />

                <label>Colors (comma separated)</label>
                <input type="text" placeholder="e.g. red,blue" onChange={(e) => setProduct({ ...product, colors: e.target.value.split(',') })} />

                <label>Sizes (comma separated)</label>
                <input type="text" placeholder="e.g. S,M,L" onChange={(e) => setProduct({ ...product, sizes: e.target.value.split(',') })} />

                <label>Upload Image</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                {errors.images && <p className="error-message">{errors.images}</p>}

                <button type="submit">List Product</button>
            </form>

            {product.images.length > 0 && (
                <div className="image-preview">
                    <h3>Image Preview</h3>
                    <div className="image-grid">
                        <img src={URL.createObjectURL(product.images[0])} alt="Preview" />
                    </div>
                </div>
            )}
        </div>
    );
}