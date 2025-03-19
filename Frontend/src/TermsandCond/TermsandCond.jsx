import './TermsAndConditions.css'
export default function TermsAndConditions(){
    return(
        <div className="terms-container">
            <h1>Terms & Conditions</h1>
            <p>Last Updated: March 17, 2025</p>

            <section>
                <h2>1. Introduction</h2>
                <p>Welcome to SportX! By using our platform, you agree to comply with these Terms & Conditions. Please read them carefully before accessing our services.</p>
            </section>

            <section>
                <h2>2. User Accounts</h2>
                <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your login credentials.</p>
            </section>

            <section>
                <h2>3. Buying & Selling</h2>
                <ul>
                    <li>Buyers must ensure they have sufficient funds before placing bids.</li>
                    <li>Sellers must provide accurate product details.</li>
                    <li>SportX reserves the right to remove fraudulent listings.</li>
                </ul>
            </section>

            <section>
                <h2>4. Auctions & Bidding</h2>
                <p>All bids are binding. If you win an auction, you must complete the purchase within the specified time.</p>
            </section>

            <section>
                <h2>5. Payments & Transactions</h2>
                <ul>
                    <li>All payments must be made through our secure payment gateways.</li>
                    <li>SportX is not responsible for third-party payment issues.</li>
                </ul>
            </section>

            <section>
                <h2>6. Shipping & Delivery</h2>
                <p>Shipping times may vary based on location. SportX is not responsible for delays caused by third-party couriers.</p>
            </section>

            <section>
                <h2>7. Refunds & Returns</h2>
                <p>Refund policies vary by seller. Ensure you review the refund terms before purchasing.</p>
            </section>

            <section>
                <h2>8. Prohibited Activities</h2>
                <ul>
                    <li>No fraudulent activities or misleading listings.</li>
                    <li>No abuse, harassment, or offensive behavior towards other users.</li>
                    <li>Violation of these rules may result in account suspension.</li>
                </ul>
            </section>

            <section>
                <h2>9. Limitation of Liability</h2>
                <p>SportX is not liable for any losses, damages, or disputes arising from transactions conducted on the platform.</p>
            </section>

            <section>
                <h2>10. Changes to Terms</h2>
                <p>We may update these terms from time to time. Continued use of SportX after changes means you accept the new terms.</p>
            </section>

            <section className="terms-contact">
                <h2>11. Contact Us</h2>
                <p>If you have any questions, reach out to us at:</p>
                <p><strong>Email:</strong> support@sportx.com</p>
            </section>
        </div>
    );
    
}