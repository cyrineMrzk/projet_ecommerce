import { faClock, faGavel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import dumbell from "../images/dumbell.jpg";
import './AuctionCard.css';
import { Link } from "react-router-dom";
export default function AuctionCard({ product }) {
    const [timeLeft, setTimeLeft] = useState(product.auctionEnd - Date.now());
    const [currentBid, setCurrentBid] = useState(product.startingBid);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(product.auctionEnd - Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, [product.auctionEnd]);

    const handleBid = () => {
        setCurrentBid((prevBid) => prevBid + product.bidIncrement);
    };

    const formatTime = (ms) => {
        if (ms <= 0) return "Auction Ended";
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}h ${minutes}m ${seconds}s`;
    };
    return (
        <div className="auction-product-card">
            
            <img src={dumbell} alt={product.name} />
            <div className="auction-info">
                <h2>{product.name}</h2>
                <p>{product.type}</p>
                <div className="auction-timer">
                    <FontAwesomeIcon icon={faClock} /> {formatTime(timeLeft)}
                </div>
                <div className="auction-price">
                    <span>Current Bid: {currentBid} Da</span>
                </div>
            </div>
            <button  className="bid-button">
                <Link to='/auctions/auction' className="link">
                
                <FontAwesomeIcon icon={faGavel} /> view Product
                </Link>
            </button>
        
        </div>
    );
}