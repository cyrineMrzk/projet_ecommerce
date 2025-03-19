import React from 'react';
import './AboutUs.css';
import aboutusimage from '../images/powerful-fitness-gym-background_849761-28996.avif'
export default function AboutUs() {
   return(
        <div className="about-us">  
            
            
            <section className="mission-vision">
                <h2>Our Mission</h2>
                <p>We strive to provide a seamless and trustworthy auction experience for buyers and sellers worldwide.</p>
                <h2>Our Vision</h2>
                <p>To be the leading online auction platform, offering exclusive products and secure transactions.</p>
            </section>
            
            
            <section className="our-story">
                <h2>Our Story</h2>
                <p>Founded with a passion for unique finds and competitive bidding, we have grown into a trusted marketplace for collectors and enthusiasts.</p>
            </section>
            
           
            <section className="why-choose-us">
                <h2>Why Choose Us?</h2>
                <ul>
                    <li>✅ Secure Transactions</li>
                    <li>✅ Verified Listings</li>
                    <li>✅ Exclusive Products</li>
                    <li>✅ 24/7 Customer Support</li>
                </ul>
            </section>
            
            
            <section className="cta">
                <h2>Join Our Community</h2>
                <p>Start bidding on exclusive items or list your products for auction today!</p>
                <button className="cta-button">Explore Auctions</button>
                <button className="cta-button">Explore Products</button>
            </section>
        </div>
    );
}
