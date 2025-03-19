import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight,faSearch } from "@fortawesome/free-solid-svg-icons";
import "./Herosection.css";
import { motion } from "framer-motion";
import gymbg from "../images/gymbg.jpg";
import { useEffect, useState } from "react";

export default function Herosection() {
    const [text, setText] = useState("");
  const fullText = "Upgrade Your Fitness Game!";
  const typingSpeed = 100; // Speed of typing effect

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, typingSpeed);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero">
      <div className="overlay"></div>
      <img src={gymbg} alt="Gym Background" className="hero-bg" />
      <div className="hero-content">
        <motion.h1 
          initial={{ opacity: 0, y: -30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1 }}
        >
          {text}
        </motion.h1>
        <p>Top-quality gym equipment, supplements, and accessories at the best prices.</p>

        <div className="hero-buttons">
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            transition={{ duration: 0.3 }}
            className="shop-btn"
          >
            Shop Now <FontAwesomeIcon icon={faArrowRight} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            transition={{ duration: 0.3 }}
            className="auction-btn"
          >
            Explore Auctions <FontAwesomeIcon icon={faArrowRight} />
          </motion.button>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search for products..." />
          <button><FontAwesomeIcon icon={faSearch}/> </button>
        </div>
      </div>
    </div>
  );

}