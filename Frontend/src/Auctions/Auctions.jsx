import React, { useState, useEffect } from "react";
import AuctionCard from "../AuctionCard/AuctionCard";
import './Auctions.css';

export default function Auctions() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch active auctions from the backend
        const fetchAuctions = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://127.0.0.1:8000/api/auctions/');
                
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch auctions: ${response.status}`);
                }
                
                const data = await response.json();
                setAuctions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAuctions();
    }, []);

    if (loading) return <div>Loading auctions...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="auctions-page">
            <h1>Live Auctions</h1>
            <div className="auctions-grid">
                {auctions.length > 0 ? (
                    auctions.map((auction) => (
                        <AuctionCard key={auction.id} auction={auction} />
                    ))
                ) : (
                    <p>No active auctions available at the moment.</p>
                )}
            </div>
        </div>
    );
}