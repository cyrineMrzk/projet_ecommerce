import React from "react";
import AuctionCard from "../AuctionCard/AuctionCard";
import './Auctions.css';
const auctionProducts = [
    {
        id: 1,
        name: "Dumbbell Set",
        type: "Weightlifting Equipment",
        auctionEnd: Date.now() + 3600000, // 1 hour from now
        startingBid: 5000,
        bidIncrement: 500,
    },
    {
        id: 2,
        name: "Bench Press Machine",
        type: "Gym Equipment",
        auctionEnd: Date.now() + 7200000, // 2 hours from now
        startingBid: 15000,
        bidIncrement: 1000,
    },
    {
        id: 3,
        name: "Kettlebell Set",
        type: "Weightlifting Equipment",
        auctionEnd: Date.now() + 5400000, // 1.5 hours from now
        startingBid: 7000,
        bidIncrement: 700,
    }
];
export default function Auctions(){
    return(
        <div className="auctions-page">
        <h1>Live Auctions</h1>
        <div className="auctions-grid">
            {auctionProducts.map((product) => (
                <AuctionCard key={product.id} product={product} />
            ))}
        </div>
    </div>
    )
}