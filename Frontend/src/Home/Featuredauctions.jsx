import React, { useEffect, useState } from 'react';
import AuctionCard from "../AuctionCard/AuctionCard";
import './featuredauctions.css';

export default function Featuredauctions() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch('http://127.0.0.1:8000/api/auctions/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log("Active auctions:", data);
                setAuctions(data.auctions || []);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching auctions:', error);
                setError('Failed to load auctions');
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading auctions...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (auctions.length === 0) {
        return <p>No active auctions found</p>;
    }

    return (
        <section className="featured-auctions">
            <h2 className="title">Featured Auctions</h2>
            <div className="auction-container">
                {auctions.map((auction) => (
                    <AuctionCard 
                        key={auction.id} 
                        product={{
                            id: auction.id,
                            name: auction.product_name,
                            type: auction.category,
                            startingBid: auction.starting_bid,
                            currentBid: auction.current_bid,
                            bidIncrement: auction.bid_increment,
                            auctionEnd: new Date(auction.end_date).getTime()
                        }} 
                    />
                ))}
            </div>
            <button className="see-all-button">
                See All Auctions
            </button>
        </section>
    );
}
