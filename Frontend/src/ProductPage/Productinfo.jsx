import {faHeart} from '@fortawesome/free-regular-svg-icons';
import './Productinfo.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from 'react';
import dumbell from '../images/dumbell.jpg'; // Fallback image

export default function ProductInfo({ product }) {
    // Initialize state with default values
    const [selectedColor, setSelectedColor] = useState('');
    const [mainImage, setMainImage] = useState('');
    const [availableSizes, setAvailableSizes] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [sizeDropdown, setSizeDropdown] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showDescription, setShowDescription] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [thumbnails, setThumbnails] = useState([]);
    
    // Update state when product data is available
    useEffect(() => {
        if (product) {
            // Set initial color if product has colors
            if (product.colors && product.colors.length > 0) {
                setSelectedColor(product.colors[0]);
            }
            
            // Set available sizes from product
            if (product.sizes) {
                setAvailableSizes(product.sizes);
            }
            
            // Set main image and thumbnails
            if (product.images && product.images.length > 0) {
                setMainImage(product.images[0]);
                setThumbnails(product.images);
            } else if (product.image) {
                setMainImage(product.image);
                setThumbnails([product.image]);
            } else {
                // Fallback to default image
                setMainImage(dumbell);
                setThumbnails([dumbell]);
            }
        }
    }, [product]);
    
    // Add a check for product after all hooks are declared
    if (!product) {
        return <div>Loading product information...</div>;
    }
    
    const increaseQuantity = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };
    
    const decreaseQuantity = () => {
        if(quantity > 1){
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };
    
    const handleInputChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if(!isNaN(value) && value >= 1){
            setQuantity(value);
        }
    }
    
    const handleThumbnailClick = (clickedImage) => {
        setMainImage(clickedImage);
    };
    
    const handleColorChange = (color) => {
        setSelectedColor(color);
        // If we have color-specific images, we would update them here
    }
    
    const toggleSizeDropdown = () => setSizeDropdown(!sizeDropdown);
    
    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setSizeDropdown(false);
    }
    
    // Function to get image URL (handles both full URLs and relative paths)
    const getImageUrl = (imagePath) => {
        if (!imagePath) return dumbell;
        
        if (imagePath.startsWith('http')) {
            return imagePath;
        }
        
        try {
            return require(`../images/${imagePath}`);
        } catch (error) {
            console.error(`Failed to load image: ${imagePath}`, error);
            return dumbell;
        }
    };
    
    return (
        <div className="productinfo">
            <div className="gallery">
                <img src={getImageUrl(mainImage)} alt={product.name} className="mainimg"/>
                <div className="thumbnails">
                    {thumbnails.map((img, index) => (
                        <img
                            key={index}
                            src={getImageUrl(img)}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            onClick={() => handleThumbnailClick(img)}
                            className='thumbnailimg'
                        />
                    ))}
                </div>
            </div>
            <div className="productdetails">
                <div className="productdescription">
                    <h2>{product.name}</h2>
                    <span>{product.type}</span>
                    <span className="price">{product.price} Da</span>
                </div>
                <div className="productactions">
                    {product.colors && product.colors.length > 0 && (
                        <div className="colorsselection">
                            <span>Select color:</span>
                            <span className="selected-color-name">{selectedColor}</span>
                            <div className='colors'>
                                {product.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`color-option ${selectedColor === color ? "selected-color" : ""}`}
                                        style={{ backgroundColor: color.toLowerCase() }}
                                        onClick={() => handleColorChange(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {availableSizes.length > 0 && (
                        <div className="sizeselection">
                            <button onClick={toggleSizeDropdown}>
                                {selectedSize ? `Size: ${selectedSize}` : "Select size"}
                            </button>
                            {sizeDropdown && (
                                <ul className='size-dropdown'>
                                    {availableSizes.map((size, index) => (
                                        <li key={index} onClick={() => handleSizeSelect(size)}>{size}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    
                    <div className='quantityselection'>
                        <button onClick={decreaseQuantity}>-</button>
                        <input type="text" onChange={handleInputChange} value={quantity}/>
                        <button onClick={increaseQuantity}>+</button>
                    </div>
                    
                    <div className='cartactions'>
                        <div className='firstaction'>
                            <button>Add to cart</button>
                            <button className='heart-button'>
                                <FontAwesomeIcon icon={faHeart} size="2xl" style={{color:"black"}} />
                            </button>
                        </div>
                        <span>Or</span>
                        <button>Buy now</button>
                    </div>
                    
                    <div className='moreinfo'>
                        <span>Description {" "}
                            <button onClick={() => setShowDescription(!showDescription)}>
                                {showDescription ? "-" : "+"}
                            </button>
                        </span>
                        {showDescription && (
                            <p className='info-content'>{product.description || "No description available."}</p>
                        )}
                        
                        <span>Details {" "}
                            <button onClick={() => setShowDetails(!showDetails)}>
                                {showDetails ? "-" : "+"}
                            </button>
                        </span>
                        {showDetails && (
                            <p className='info-content'>
                                {product.details || 
                                 `Brand: ${product.brand || 'N/A'}\n
                                  Category: ${product.category || 'N/A'}\n
                                  Material: ${product.material || 'N/A'}`}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

