import { NavLink } from "react-router-dom";
import './footer.css';
export default function Footer() {
    return (
        <div className="footer-container">
        <div className="footer">
            <div className="footer-logo">
            <h1>SportX</h1>
            <span>"Your trusted place"</span>
            </div>
<div className="footer-links">
                <h2>Shop</h2>
                <NavLink to="/products?category=gym-equipement">Gym Equipement</NavLink>
                <NavLink to="/products?category=cardio-endurance">Cardio & endurance</NavLink>
                <NavLink to="/products?category=supplements-nutrition">Supplements</NavLink>
                <NavLink to="/products?category=accessoires">Accessoires</NavLink>
                <NavLink to="/auctions">Auction</NavLink>
</div>

<div className="footer-links">
                <h2>Informations</h2>
                <a href="/aboutus">About Us</a>
                <a href="/faq">FAQ</a>
                <a href="/privacy&policy">Privacy Policy</a>
                <a href="/terms&conditions">Terms & Conditions</a>
</div>
<div className="footer-links">
                <h2>Customer service</h2>
                <a href="/contactus">Contact Us</a>
                <a href="/ordertracking">Order Tracking</a>
                <a href="/sellerdashboard">Sell on Our Platform</a>
</div>
            <div className="footer-social">
                <h2>Follow us</h2>
                <a href="https://www.tiktok.com/"><img src="https://img.icons8.com/ios/50/000000/tiktok--v1.png" alt="tiktok" /></a>
                <a href="https://www.instagram.com/"><img src="https://img.icons8.com/ios/50/000000/instagram-new--v1.png" alt="instagram" /></a>
                <a href="https://www.x.com/"><img src="https://img.icons8.com/ios/50/000000/x--v1.png" alt="X" /></a>
                </div>

                
        </div>
        <span className="footer-copy">© 2025 SportX. All rights reserved</span>
        </div>
    )
}