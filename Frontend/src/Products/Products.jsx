import { useState } from "react";
import dumbell from "../images/dumbell.jpg";
import ProductCard from "../ProductCard/ProductCard";
import './Products.css'
import { useLocation } from "react-router-dom";
export default function Products({ allProducts}) {
    const location=useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedCategory=queryParams.get("category");
    const [sortBy, setSortBy] = useState("latest");
    const [brand, setBrand] = useState("all");
    const [gender, setGender] = useState("all");
    const [color, setColor] = useState("all");
    const [size, setSize] = useState("all");
    const [priceRange, setPriceRange] = useState([0, 15000]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const allProductsList= [
        { id: 1, name: "Chaussures Nike Air", category: "Accessories", price: 8000, image: dumbell, brand: "Nike", gender: "Homme", color: "Noir", size: "42", dateAdded: "2024-03-01", rating: 4.8, popularity: 200 },
        { id: 2, name: "T-shirt Adidas", category: "Gym Equipement", price: 3000, image: dumbell, brand: "Adidas", gender: "Unisexe", color: "Blanc", size: "M", dateAdded: "2024-02-25", rating: 4.5, popularity: 500 },
        { id: 3, name: "Pantalon Puma", category: "Cardio & Endurance", price: 5000, image: dumbell, brand: "Puma", gender: "Femme", color: "Bleu", size: "L", dateAdded: "2024-03-05", rating: 4.9, popularity: 100 }
    ];
    const filteredByCategory = selectedCategory 
        ? allProductsList.filter(product => product.category === selectedCategory)
        : allProductsList;

    const filteredProducts = filteredByCategory.filter(product =>
        (brand === "all" || product.brand === brand) &&
        (gender === "all" || product.gender === gender) &&
        (color === "all" || product.color === color) &&
        (size === "all" || product.size === size) &&
        product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === "latest") return new Date(b.dateAdded) - new Date(a.dateAdded);
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "popular") return b.popularity - a.popularity;
        return 0;
    });
    return (
        <div className="products-page">
        <h1>Shop Our Products</h1>

       
        <button className="filter-toggle-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            {isFilterOpen ? "Close Filters" : "Filter"}
        </button>

        
        <div className={`filter-panel ${isFilterOpen ? "open" : ""}`}>
                <div className="filter">
                    <label>Marque:</label>
                    <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="Nike">Nike</option>
                        <option value="Adidas">Adidas</option>
                        <option value="Puma">Puma</option>
                    </select>
                </div>

                <div className="filter">
                    <label>Sexe:</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="all">Tous</option>
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                        <option value="Unisexe">Unisexe</option>
                    </select>
                </div>

                <div className="filter">
                    <label>Couleur:</label>
                    <select value={color} onChange={(e) => setColor(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="Noir">Noir</option>
                        <option value="Blanc">Blanc</option>
                        <option value="Bleu">Bleu</option>
                    </select>
                </div>

                <div className="filter">
                    <label>Taille:</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)}>
                        <option value="all">Toutes</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                    </select>
                </div>

                <div className="filter">
                    <label>Prix:</label>
                    <input type="range" min="0" max="15000" value={priceRange[0]} onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}/>
                    <input type="range" min="0" max="15000" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}/>
                    <span>{priceRange[0]} Da - {priceRange[1]} Da</span>
                </div>
            </div>
        
        <div className="sort">
            <label>Sort by: </label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="latest">Latest</option>
                <option value="rating">Rating</option>
                <option value="popular">Most Popular</option>
            </select>
        </div>

        <div className="products-grid">
            {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => <ProductCard key={product.id} product={product} />)
            ) : (
                <p className="no-products">No products match your filters.</p>
            )}
        </div>
    </div>
);
}