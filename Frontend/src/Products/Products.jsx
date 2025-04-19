import { useState, useEffect } from "react";
import dumbell from "../images/dumbell.jpg";
import ProductCard from "../ProductCard/ProductCard";
import './Products.css';
import { useLocation } from "react-router-dom";

export default function Products() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedCategorySlug = queryParams.get("category");
    
    // Map the URL slug to the exact backend category name
    const getCategoryFromSlug = (slug) => {
        switch(slug) {
            case 'gym-equipment':
            case 'gym-equipement': // Handle common typo
                return 'Gym Equipment';
            case 'cardio-endurance':
                return 'Cardio & Endurance';
            case 'supplements':
            case 'supplements-nutrition':
                return 'Supplements';
            case 'accessories':
            case 'accessoires':
                return 'Accessories';
            default:
                return null;
        }
    };
    
    // Get the actual category name for the API
    const selectedCategory = getCategoryFromSlug(selectedCategorySlug);
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [sortBy, setSortBy] = useState("latest");
    const [brand, setBrand] = useState("all");
    const [gender, setGender] = useState("all");
    const [color, setColor] = useState("all");
    const [size, setSize] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 15000]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    
    // Available filter options (will be populated from API data)
    const [availableBrands, setAvailableBrands] = useState([]);
    const [availableColors, setAvailableColors] = useState([]);
    const [availableSizes, setAvailableSizes] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Build query parameters
                const params = new URLSearchParams();
                
                if (selectedCategory) params.append('category', selectedCategory);
                if (brand !== 'all') params.append('brand', brand);
                if (gender !== 'all') params.append('gender', gender);
                
                console.log("Fetching with category:", selectedCategory);
                const response = await fetch(`http://127.0.0.1:8000/api/fetch?${params.toString()}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                
                const data = await response.json();
                setProducts(data.products || []);
                
                // Extract filter options
                if (data.products && data.products.length > 0) {
                    // Brands
                    const brands = [...new Set(data.products
                        .filter(p => p.brand)
                        .map(p => p.brand))];
                    setAvailableBrands(brands);
                    
                    // Colors (flatten all color arrays)
                    const allColors = data.products
                        .filter(p => p.colors && p.colors.length > 0)
                        .flatMap(p => p.colors);
                    setAvailableColors([...new Set(allColors)]);
                    
                    // Sizes (flatten all size arrays)
                    const allSizes = data.products
                        .filter(p => p.sizes && p.sizes.length > 0)
                        .flatMap(p => p.sizes);
                    setAvailableSizes([...new Set(allSizes)]);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Failed to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProducts();
    }, [selectedCategory, brand, gender]);  // Add dependencies for filters that trigger API calls

    // Apply client-side filtering
    const filteredProducts = products.filter(product => {
        // Brand filter
        if (brand !== "all" && product.brand !== brand) return false;
        
        // Gender filter
        if (gender !== "all" && product.gender !== gender) return false;
        
        // Color filter
        if (color !== "all" && (!product.colors || !product.colors.includes(color))) return false;
        
        // Size filter
        if (size !== "all" && (!product.sizes || !product.sizes.includes(size))) return false;
        
        // Price range filter
        if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
        
        return true;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "latest") {
            // Sort by date if available, otherwise by id (newer products have higher ids)
            return a.date_added && b.date_added 
                ? new Date(b.date_added) - new Date(a.date_added)
                : b.id - a.id;
        }
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        if (sortBy === "popular") return (b.popularity || 0) - (a.popularity || 0);
        if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
        return 0;
    });

    // Format category name for display
    const formatCategoryName = (categorySlug) => {
        if (!categorySlug) return "All Products";
        
        // Use the mapped category name if available, otherwise format the slug
        const mappedCategory = getCategoryFromSlug(categorySlug);
        if (mappedCategory) return mappedCategory;
        
        // Fallback to formatting the slug
        return categorySlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="products-page">
            <h1>{formatCategoryName(selectedCategorySlug)}</h1>
            
            <button className="filter-toggle-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                {isFilterOpen ? "Close Filters" : "Filter"}
            </button>
            
            <div className={`filter-panel ${isFilterOpen ? "open" : ""}`}>
                <div className="filter">
                    <label>Brand:</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                        <option value="all">All Brands</option>
                        {availableBrands.map(brand => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter">
                    <label>Gender:</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="all">All</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                    </select>
                </div>
                
                <div className="filter">
                    <label>Color:</label>
                    <select value={color} onChange={(e) => setColor(e.target.value)}>
                        <option value="all">All Colors</option>
                        {availableColors.map(color => (
                            <option key={color} value={color}>{color}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter">
                    <label>Size:</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)}>
                        <option value="all">All Sizes</option>
                        {availableSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
                
                <div className="filter">
                    <label>Price Range:</label>
                    <div className="price-range-inputs">
                        <input 
                            type="range"
                            min="0"
                            max="15000"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        />
                        <input 
                            type="range"
                            min="0"
                            max="15000"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        />
                    </div>
                    <span className="price-range-display">{priceRange[0]} Da - {priceRange[1]} Da</span>
                </div>
            </div>
            
            <div className="sort">
                <label>Sort by: </label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="latest">Latest</option>
                    <option value="rating">Rating</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>
            </div>
            
            {loading ? (
                <div className="loading">Loading products...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="products-grid">
                    {sortedProducts.length > 0 ? (
                        sortedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="no-products">No products match your filters.</p>
                    )}
                </div>
            )}
        </div>
    );
}
