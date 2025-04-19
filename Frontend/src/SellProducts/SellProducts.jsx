import './SellProducts.css';
import { useState, useEffect } from "react";
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
        images: [],
        stock_quantity: 1, // New field
        is_available: true // New field
    });
    const [errors, setErrors] = useState({
        images: "",
        category: ""
    });
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login", { state: { message: "Please login to list products" } });
        }
    }, [navigate]);

    const categories = ["Gym equipement", "Cardio & Endurance", "Supplements", "Accessoires"];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === "checkbox" ? checked : value;
        setProduct({ ...product, [name]: fieldValue });
        if (name === "category" && value) {
            setErrors({ ...errors, category: "" });
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setProduct((prevProduct) => ({
                ...prevProduct,
                images: [...files],
            }));
            
            setErrors((prevErrors) => ({
                ...prevErrors,
                images: files.length === 0 ? "Please upload at least 1 image." : "",
            }));
        }
    };
    
    const removeImage = (index) => {
        setProduct(prevProduct => ({
            ...prevProduct,
            images: prevProduct.images.filter((_, i) => i !== index)
        }));
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
        formData.append("stock_quantity", product.stock_quantity); // New field
        formData.append("is_available", product.is_available); // New field
        product.images.forEach(image => {
            formData.append("images", image);
        });

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://127.0.0.1:8000/api/products/", {
                method: "POST",
                headers: {
                    "Authorization": `Token ${token}`
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
                images: [],
                stock_quantity: 1,
                is_available: true
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
                <label>Stock Quantity</label>
                <input type="number" name="stock_quantity" value={product.stock_quantity} onChange={handleChange} required />
                <label>Is Available</label>
                <input type="checkbox" name="is_available" checked={product.is_available} onChange={handleChange} />
                <label>Colors (comma separated)</label>
                <input type="text" placeholder="e.g. red,blue" onChange={(e) => setProduct({ ...product, colors: e.target.value.split(',') })} />
                <label>Sizes (comma separated)</label>
                <input type="text" placeholder="e.g. S,M,L" onChange={(e) => setProduct({ ...product, sizes: e.target.value.split(',') })} />
                <label>Upload Image</label>
                <input type="file" accept="image/*" multiple onChange={handleFileChange} />
                {errors.images && <p className="error-message">{errors.images}</p>}
                <button type="submit">List Product</button>
            </form>
            {product.images.length > 0 && (
                <div className="image-preview">
                    <h3>Image Preview ({product.images.length} images)</h3>
                    <div className="image-grid">
                        {product.images.map((image, index) => (
                            <div key={index}>
                                <img 
                                    src={URL.createObjectURL(image)} 
                                    alt={`Preview ${index + 1}`} 
                                    style={{width: "100px", height: "100px", margin: "5px"}}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => removeImage(index)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
