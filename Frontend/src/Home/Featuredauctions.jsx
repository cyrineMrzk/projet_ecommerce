import './featuredauctions.css';
import AuctionCard from "../AuctionCard/AuctionCard";

const auctionItems = [
    { id: 1, name: "Heavy Dumbell", type: "Gym Equipment", startingBid: 1500, bidIncrement: 100, auctionEnd: Date.now() + 3600000 },
    { id: 2, name: "Bench Press", type: "Gym Equipment", startingBid: 5000, bidIncrement: 500, auctionEnd: Date.now() + 7200000 },
    { id: 3, name: "Treadmill", type: "Gym Equipment", startingBid: 10000, bidIncrement: 1000, auctionEnd: Date.now() + 10800000 },
    { id: 4, name: "Kettlebell 16kg", type: "Gym Equipment", startingBid: 3000, bidIncrement: 200, auctionEnd: Date.now() + 14400000 },
];
export default function Featuredauctions() {

    return (
        <section className="featured-auctions">
            <h2 className="title">Featured Auctions</h2>
            <div className="auction-container">
                {auctionItems.map((product) => (
                    <AuctionCard key={product.id} product={product} />
                ))}
            </div>
            <button className="see-all-button" >
                See All Auctions
            </button>
        </section>
    );
}