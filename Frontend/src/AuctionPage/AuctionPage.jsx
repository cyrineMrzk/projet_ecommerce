import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AuctionPage.css';
import dumbell from '../images/dumbell.jpg'; // Fallback image - make sure you have this file or replace with your actual fallback

export default function AuctionPage() {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    
    // State variables
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainImageSrc, setMainImageSrc] = useState('');
    const [bidAmount, setBidAmount] = useState(0);
    const [bidError, setBidError] = useState('');
    const [bidSuccess, setBidSuccess] = useState('');
    const [showDescription, setShowDescription] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [thumbnails, setThumbnails] = useState([]);

    // Fetch auction details
    useEffect(() => {
        const fetchAuctionDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://127.0.0.1:8000/api/auctions/${auctionId}/`);
                setAuction(response.data);
                
                // Set thumbnails and initial main image
                if (response.data.product.images && response.data.product.images.length > 0) {
                    setMainImageSrc(response.data.product.images[0]);
                    setThumbnails(response.data.product.images);
                } else if (response.data.product.image) {
                    // Handle single image case
                    setMainImageSrc(response.data.product.image);
                    setThumbnails([response.data.product.image]);
                } else {
                    // Fallback to default image
                    setMainImageSrc(dumbell);
                    setThumbnails([dumbell]);
                }
                
                // Set initial bid amount to current bid + increment
                setBidAmount(parseFloat(response.data.current_bid) + parseFloat(response.data.bid_increment));
                
                // Check if product is in favorites
                checkIfFavorite(response.data.product.id);
                
                setLoading(false);
            } catch (err) {
                setError('Failed to load auction details');
                setLoading(false);
                console.error(err);
            }
        };
        
        fetchAuctionDetails();
    }, [auctionId]);
    
    // Update time remaining
    useEffect(() => {
        if (!auction || !auction.is_active) return;
        
        const calculateTimeRemaining = () => {
            const endDate = new Date(auction.end_date);
            const now = new Date();
            const diff = endDate - now;
            
            if (diff <= 0) {
                setTimeRemaining('Auction ended');
                return;
            }
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };
        
        calculateTimeRemaining();
        const timer = setInterval(calculateTimeRemaining, 1000);
        
        return () => clearInterval(timer);
    }, [auction]);
    
    // Check if product is in favorites
    const checkIfFavorite = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await axios.get('http://127.0.0.1:8000/api/favorites/', {
                headers: { Authorization: `Token ${token}` }
            });
            
            const isFav = response.data.favorites.some(fav => fav.product_id === productId);
            setIsFavorite(isFav);
        } catch (err) {
            console.error('Error checking favorites:', err);
        }
    };
    
    // Function to get image URL (handles both full URLs and relative paths)
    const getImageUrl = (imagePath) => {
        if (!imagePath) return dumbell;
        if (imagePath.startsWith('http')) return imagePath;
        return dumbell; // Fallback for relative paths if needed
    };
    
    // Handle thumbnail click
    const handleThumbnailClick = (clickedImage) => {
        setMainImageSrc(clickedImage);
    };

    // Handle bid input change
    const handleBidChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            setBidAmount(value);
            
            // Clear previous error/success messages
            setBidError('');
            setBidSuccess('');
        }
    };

    // Place bid
    const placeBid = async () => {
        if (!auction) return;
        
        // Validate bid amount
        if (bidAmount <= auction.current_bid) {
            setBidError(`Bid must be higher than current bid of ${auction.current_bid} Da`);
            return;
        }
        
        if (bidAmount < (auction.current_bid + auction.bid_increment)) {
            setBidError(`Minimum bid increment is ${auction.bid_increment} Da`);
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { state: { from: `/auction/${auctionId}` } });
                return;
            }
            
            const response = await axios.post(
                `http://127.0.0.1:8000/api/auctions/${auctionId}/bid/`, 
                { amount: bidAmount },
                { headers: { Authorization: `Token ${token}` } }
            );
            
            // Update auction data with new bid
            setAuction({
                ...auction,
                current_bid: response.data.current_bid,
                highest_bidder: response.data.highest_bidder
            });
            
            // Set next bid amount
            setBidAmount(response.data.current_bid + auction.bid_increment);
            
            // Show success message
            setBidSuccess('Bid placed successfully!');
            setBidError('');
            
            // Refresh auction details
            setTimeout(() => {
                axios.get(`http://127.0.0.1:8000/api/auctions/${auctionId}/`)
                    .then(res => setAuction(res.data))
                    .catch(err => console.error('Error refreshing auction data:', err));
            }, 1000);
            
        } catch (err) {
            setBidError(err.response?.data?.error || 'Failed to place bid');
            console.error(err);
        }
    };
    
    // Toggle favorite
const toggleFavorite = async () => {
    if (!auction) return;
    
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login', { state: { from: `/auction/${auctionId}` } });
            return;
        }
        
        if (isFavorite) {
            // Remove from favorites - using the correct URL format
            await axios.delete(`http://127.0.0.1:8000/api/favorites/remove/${auction.product.id}/`, {
                headers: { Authorization: `Token ${token}` }
            });
            // Update state immediately to show visual feedback
            setIsFavorite(false);
        } else {
            // Add to favorites
            await axios.post('http://127.0.0.1:8000/api/favorites/add/', 
                { product_id: auction.product.id },
                { headers: { Authorization: `Token ${token}` } }
            );
            // Update state immediately to show visual feedback
            setIsFavorite(true);
        }
        
    } catch (err) {
        console.error('Error toggling favorite:', err);
        // Alert user if there was an error
        alert(err.response?.data?.error || 'Failed to update favorites');
    }
};
    if (loading) return <div className="loading">Loading auction details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!auction) return <div className="error">Auction not found</div>;

    return (
        <div className="auction-product">
            <div className="gallery">
                <img src={getImageUrl(mainImageSrc)} alt="Main Auction Item" className="main-img" />
                <div className="thumbnails">
                    {thumbnails.map((img, index) => (
                        <img
                            key={index}
                            src={getImageUrl(img)}
                            alt={`Thumbnail ${index + 1}`}
                            onClick={() => handleThumbnailClick(img)}
                            className={`thumbnail-img ${mainImageSrc === img ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>
            <div className="product-details">
                <div className="product-description">
                    <h2>{auction.product.name}</h2>
                    <span>Category: {auction.product.category}</span>
                    <span className="starting-bid">Starting Bid: {auction.starting_bid} Da</span>
                    <span className="current-bid">Current Bid: {auction.current_bid} Da</span>
                    {auction.highest_bidder && (
                        <span className="highest-bidder">Highest Bidder: {auction.highest_bidder}</span>
                    )}
                    <span className="time-remaining">Time Remaining: {timeRemaining}</span>
                </div>
                <div className="auction-actions">
                    {auction.is_active ? (
                        <div className='bid-selection'>
                            <input
                                type="number"
                                onChange={handleBidChange}
                                value={bidAmount}
                                min={auction.current_bid + auction.bid_increment}
                                step={auction.bid_increment}
                            />
                            <button onClick={placeBid} className='bid-button'>Place Bid</button>
                            {bidError && <div className="error-message">{bidError}</div>}
                            {bidSuccess && <div className="success-message">{bidSuccess}</div>}
                        </div>
                    ) : (
                        <div className="auction-ended">
                            <p>This auction has ended</p>
                            {auction.highest_bidder && (
                                <p>Winner: {auction.highest_bidder}</p>
                            )}
                        </div>
                    )}
                    <div className='wishlist'>
                        <button className='heart-button' onClick={toggleFavorite}>
                            <FontAwesomeIcon 
                                icon={isFavorite ? fasHeart : farHeart}
                                size="2xl"
                                style={{ color: isFavorite ? "red" : "black" }}
                            />
                        </button>
                    </div>
                    <div className='more-info'>
                        <span>Description {' '}
                            <button onClick={() => setShowDescription(!showDescription)}>
                                {showDescription ? "-" : "+"}
                            </button>
                        </span>
                        {showDescription && (
                            <p className='info-content'>{auction.product.description}</p>
                        )}
                        <span>Details {' '}
                            <button onClick={() => setShowDetails(!showDetails)}>
                                {showDetails ? "-" : "+"}
                            </button>
                        </span>
                        {showDetails && (
                            <p className='info-content'>
                                Brand: {auction.product.brand}<br/>
                                Category: {auction.product.category}<br/>
                                Auction Start: {new Date(auction.start_date).toLocaleString()}<br/>
                                Auction End: {new Date(auction.end_date).toLocaleString()}<br/>
                                Bid Increment: {auction.bid_increment} Da
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}