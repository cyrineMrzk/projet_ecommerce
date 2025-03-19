import { faHeart } from '@fortawesome/free-regular-svg-icons';
import mainImage from '../images/newbalance1.jpg';
import thumbnail1 from '../images/newbalance2.webp';
import thumbnail2 from '../images/newbalance3.webp';
import './AuctionPage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

export default function AuctionPage() {
    const imageVariants = [mainImage, thumbnail1, thumbnail2];
    const [mainImageSrc, setMainImageSrc] = useState(imageVariants[0]);
    const [startingBid, setStartingBid] = useState(50);
    const [currentBid, setCurrentBid] = useState(50);
    const [bidAmount, setBidAmount] = useState(55);
    const [showDescription, setShowDescription] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const handleThumbnailClick = (clickedImage) => {
        setMainImageSrc(clickedImage);
    };

    const handleBidChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value > currentBid) {
            setBidAmount(value);
        }
    };

    const placeBid = () => {
        if (bidAmount > currentBid) {
            setCurrentBid(bidAmount);
            setBidAmount(bidAmount + 5);
        }
    };

    return (
        <div className="auction-product">
            <div className="gallery">
                <img src={mainImageSrc} alt="Main Auction Item" className="main-img" />
                <div className="thumbnails">
                    {imageVariants.map((img, index) => (
                        <img
                            key={index}
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            onClick={() => handleThumbnailClick(img)}
                            className='thumbnail-img' />
                    ))}
                </div>
            </div>
            <div className="product-details">
                <div className="product-description">
                    <h2>Exclusive Auction Item</h2>
                    <span>Category: Limited Edition</span>
                    <span className="starting-bid">Starting Bid: ${startingBid}</span>
                    <span className="current-bid">Current Bid: ${currentBid}</span>
                </div>
                <div className="auction-actions">
                    <div className='bid-selection'>
                        <input 
                            type="number" 
                            onChange={handleBidChange} 
                            value={bidAmount} 
                            min={currentBid + 5} 
                            step={5} 
                        />
                        <button onClick={placeBid} className='bid-button'>Place Bid</button>
                    </div>
                    <div className='wishlist'>
                        <button className='heart-button'><FontAwesomeIcon icon={faHeart} size="2xl" style={{ color: "black" }} /></button>
                    </div>
                    <div className='more-info'>
                        <span>Description {' '}
                            <button onClick={() => setShowDescription(!showDescription)}>
                                {showDescription ? "-" : "+"}
                            </button>
                        </span>
                        {showDescription && (
                            <p className='info-content'>This exclusive item is a must-have collectible with high-quality craftsmanship and rarity.</p>
                        )}
                        <span>Details {' '}
                            <button onClick={() => setShowDetails(!showDetails)}>
                                {showDetails ? "-" : "+"}
                            </button>
                        </span>
                        {showDetails && (
                            <p className='info-content'>Dimensions: 10x10 inches | Material: Premium Ceramic | Edition: 1 of 100</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


