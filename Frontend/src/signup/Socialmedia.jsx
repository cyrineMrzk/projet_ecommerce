import React from 'react';
import facebook from '../images/facebook.png';
import google from '../images/Google.png'

export default function Socialmedia() {

    
  return (
    <div>
      <a href="https://google.com" target="_blank" rel="noopener noreferrer">
      <img src={google} alt='google' style={{ width: "20px", height: "20px", marginRight: "10px" }} />
    </a>
    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
      <img src={facebook} alt='facebook' style={{ width: "20px", height: "20px" }} />
    </a>
  </div>
  );
  };
