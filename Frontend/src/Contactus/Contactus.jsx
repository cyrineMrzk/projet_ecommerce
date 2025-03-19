import { faClock, faEnvelope, faMapMarkerAlt, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Contactus.css'
export default function Contactus() {
    return (
       /* <div className="contact-cotainer">
            <h2 className="contact-title">Connect with our Team</h2>

            <div className="contact-content">
                <div className="contact-form">
                    <h3>Get in Touch With Us</h3>
                    <p>Have questions? Need help? Contact us and we’ll assist you as soon as possible.</p>
                    <form>
                        <input type="text" placeholder="Name" required/>
                        <input type="email" placeholder="Email" required />
                        <textarea placeholder="Message" required></textarea>
                        <button type="submit" className="send-button">Send</button>
                    </form>
                </div>
                <div className="contact-details">
                    <h3>Contact Details</h3>
                    <div className="contact-item">
                        <div className="icon-container">
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="icon"/>
                        </div>
                        <p><strong>Address</strong><br />Les Bannaniers,El Mohammadia</p>
                    </div>
                    <div className="contact-item">
                        <FontAwesomeIcon icon={faPhone} className="icon"/>
                        <p><strong>Mobile</strong><br />+213654342505</p>
                    </div>
                    <div className="contact-item"> 
                        <FontAwesomeIcon icon={faClock} className="icon"/>
                        <p><strong>Availability</strong><br />Daily 09 am - 05 pm</p>
                    </div>
                    <div className="contact-item">
                         <FontAwesomeIcon icon={faEnvelope} className="icon"/>
                         <p><strong>Email</strong><br />email@gmail.com</p>
                    </div>

                    <div className="social-media">
                        <button className="social-btn">
                        tiktok
                        </button>
                        <button className="social-btn">
                        instagram
                        </button>
                    </div>
                </div>
            </div>
           
        </div>
    )*/
        <div className="contact-container">
        {/* Left Section - Contact Form */}
        <div className="contact-form">
          <h2>Get in Touch</h2>
          <p>Need help? Have a question? Fill out the form and we'll get back to you!</p>
          <form>
            <div className="input-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon"/>
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="input-group">
            <FontAwesomeIcon icon={faEnvelope} className="input-icon"/>
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="input-group">
              <textarea placeholder="Your Message" required></textarea>
            </div>
            <button type="submit" className="send-button">Send Message</button>
          </form>
        </div>
  
        {/* Right Section - Contact Info */}
        <div className="contact-details">
          <h2>Contact Information</h2>
          <div className="contact-card">
          <FontAwesomeIcon icon={faMapMarkerAlt} className="icon"/>
            <p><strong>Address:</strong> Les Banonniers, El Mohammadia</p>
          </div>
          <div className="contact-card">
          <FontAwesomeIcon icon={faPhone} className="icon"/>
            <p><strong>Phone:</strong> +213654342505</p>
          </div>
          <div className="contact-card">
          <FontAwesomeIcon icon={faClock} className="icon"/>
            <p><strong>Availability:</strong> Daily 09 am - 05 pm</p>
          </div>
          <div className="contact-card">
          <FontAwesomeIcon icon={faEnvelope} className="icon"/>
            <p><strong>Email:</strong> email@gmail.com</p>
          </div>
  
          
          <div className="social-media">
            <h3>Follow Us</h3>
            <a href="https://www.tiktok.com/"><img src="https://img.icons8.com/ios/50/000000/tiktok--v1.png" alt="tiktok" /></a>
            <a href="https://www.instagram.com/"><img src="https://img.icons8.com/ios/50/000000/instagram-new--v1.png" alt="instagram" /></a>
          </div>
        </div>
      </div>
    );
}