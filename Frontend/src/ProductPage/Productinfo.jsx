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
    
    // New state for checkout modal
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [shippingAddress, setShippingAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
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
                if (product.sizes.length > 0) {
                    setSelectedSize(product.sizes[0]);
                }
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
        if (imagePath.startsWith('http')) return imagePath;
        return dumbell;
    };

    // Add to cart functionality
    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to add to cart.');
            return;
        }

        if (!selectedSize && availableSizes.length > 0) {
            alert('Please select a size.');
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/api/cart/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity,
                    color: selectedColor || product.colors?.[0] || 'Black',
                    size: selectedSize || product.sizes?.[0] || 'M'
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Product added to cart successfully!');
            } else {
                alert(data.error || 'Failed to add product to cart.');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('An error occurred while adding to cart.');
        }
    };

    // Add to favorites functionality
    const handleAddToFavorites = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to favorite products.');
            return;
        }
        try {
            const res = await fetch('http://127.0.0.1:8000/api/favorites/add/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message || 'Product added to favorites!');
            } else {
                alert(data.error || 'Failed to add to favorites.');
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            alert('An error occurred while adding to favorites.');
        }
    };

    // Buy now functionality with modal
    const handleBuyNow = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to purchase products.');
            return;
        }
        
        if (!selectedSize && availableSizes.length > 0) {
            alert('Please select a size.');
            return;
        }
        
        // Open checkout modal instead of using prompts
        setShowCheckoutModal(true);
    };
    
    // Handle checkout form input change
    const handleCheckoutInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'shippingAddress') {
            setShippingAddress(value);
        } else if (name === 'phoneNumber') {
            setPhoneNumber(value);
        }
        
        // Clear error for this field when user types
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: ''
            });
        }
    };
    
    // Validate checkout form
    const validateCheckoutForm = () => {
        let errors = {};
        let isValid = true;
        
        if (!shippingAddress.trim()) {
            errors.shippingAddress = 'Shipping address is required';
            isValid = false;
        }
        
        if (!phoneNumber.trim()) {
            errors.phoneNumber = 'Phone number is required';
            isValid = false;
        } else if (!/^[0-9+\s()-]{8,15}$/.test(phoneNumber.trim())) {
            errors.phoneNumber = 'Please enter a valid phone number';
            isValid = false;
        }
        
        setFormErrors(errors);
        return isValid;
    };
    
    // Submit order
    const submitOrder = async () => {
        if (!validateCheckoutForm()) {
            return;
        }
        
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://127.0.0.1:8000/api/orders/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity,
                    color: selectedColor || product.colors?.[0] || 'Black',
                    size: selectedSize || product.sizes?.[0] || 'M',
                    shipping_address: shippingAddress,
                    phone_number: phoneNumber
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setShowCheckoutModal(false);
                alert('Order placed successfully!');
                
                // Offer to download the invoice
                if (data.invoice_url) {
                    const downloadInvoice = window.confirm('Would you like to download your invoice?');
                    if (downloadInvoice) {
                        window.open(data.invoice_url, '_blank');
                    }
                }
                
                // Redirect to orders page
                window.location.href = '/orders';
            } else {
                alert(data.error || 'Failed to place order.');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            alert('An error occurred while placing your order.');
        } finally {
            setIsSubmitting(false);
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
                            <button onClick={handleAddToCart}>Add to cart</button>
                            <button className='heart-button' onClick={handleAddToFavorites}>
                                <FontAwesomeIcon icon={faHeart} size="2xl" style={{color:"black"}} />
                            </button>
                        </div>
                        <span>Or</span>
                        <button onClick={handleBuyNow}>Buy now</button>
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
            
            {/* Checkout Modal */}
            {showCheckoutModal && (
                <div className="checkout-modal-overlay">
                    <div className="checkout-modal">
                        <div className="checkout-modal-header">
                            <h3>Complete Your Purchase</h3>
                            <button 
                                className="close-modal-btn"
                                onClick={() => setShowCheckoutModal(false)}
                            >
                                &times;
                            </button>
                        </div>
                        <div className="checkout-modal-body">
                            <div className="checkout-product-summary">
                                <img 
                                    src={getImageUrl(mainImage)} 
                                    alt={product.name} 
                                    className="checkout-product-image"
                                />
                                <div className="checkout-product-details">
                                    <h4>{product.name}</h4>
                                    <p>Price: {product.price} Da</p>
                                    <p>Quantity: {quantity}</p>
                                    {selectedColor && <p>Color: {selectedColor}</p>}
                                    {selectedSize && <p>Size: {selectedSize}</p>}
                                    <p className="checkout-total">Total: {product.price * quantity} Da</p>
                                </div>
                            </div>
                            
                            <form className="checkout-form">
                                <div className="form-group">
                                    <label htmlFor="shippingAddress">Shipping Address</label>
                                    <textarea
                                        id="shippingAddress"
                                        name="shippingAddress"
                                        value={shippingAddress}
                                        onChange={handleCheckoutInputChange}
                                        placeholder="Enter your full shipping address"
                                        rows={3}
                                    />
                                    {formErrors.shippingAddress && (
                                        <span className="error-message">{formErrors.shippingAddress}</span>
                                    )}
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="phoneNumber">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={phoneNumber}
                                        onChange={handleCheckoutInputChange}
                                        placeholder="Enter your phone number"
                                    />
                                    {formErrors.phoneNumber && (
                                        <span className="error-message">{formErrors.phoneNumber}</span>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="checkout-modal-footer">
                            <button 
                                className="cancel-btn"
                                onClick={() => setShowCheckoutModal(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="place-order-btn"
                                onClick={submitOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}