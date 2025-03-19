import {faHeart} from '@fortawesome/free-regular-svg-icons';
import mainwhite from '../images/newbalance1.jpg';
import thumbnail1white from '../images/newbalance2.webp';
import thumbnail2white from '../images/newbalance3.webp';
import mainblack from '../images/newbalanceblack1.webp';
import thumbnail1black from '../images/newbalanceblack2.webp';
import thumbnail2black from '../images/newbalanceblack3.webp';
import './Productinfo.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from 'react';
export default function ProductInfo() {
    
    const imagevariants = {
        white:[mainwhite,thumbnail1white,thumbnail2white],
        black:[mainblack,thumbnail1black,thumbnail2black],

    };
    const colorNames = {
        black: "Black",
        white: "white"
    };

    const availableSizes = ['37','38','39','40','41','42','43','44','45'];

    const [selectedColor,setSelectedColor]=useState('white');
    const [mainimage,setMainImage] = useState(imagevariants.white[0]);
    const thumbnails = imagevariants[selectedColor];
    const [quantity, setQuantity] = useState(1);
    const [sizeDropdown, setSizeDropdown] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showDescription, setShowDescription] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    
    const increaseQuantity = () => {
        setQuantity((prevQuantity)=>prevQuantity + 1);
    };

    const decreaseQuantity = () => {
        if(quantity > 1){
            setQuantity((prevQuantity)=>prevQuantity - 1);
        }
    };

    const handleInputChange = (e) => {
        const value = parseInt(e.target.value,10);
        if(!isNaN(value) && value >= 1){
            setQuantity(value);
        }
    }
    const handleThumbnailClick = (clickedImage) => {
            setMainImage(clickedImage);
    };

    const handleColorChange = (color) => {
        setSelectedColor(color);
        setMainImage(imagevariants[color][0]);
    }

    const toggleSizeDropdown = () => setSizeDropdown(!sizeDropdown);

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setSizeDropdown(false);
    }
    return (
        <div className="productinfo">
            <div className="gallery">
                <img src={mainimage} alt="Main"  className="mainimg"/>
                <div className="thumbnails">
                    {thumbnails.map((img,index)=>(
                        <img 
                        key={index}
                        src={img}
                        alt={`thumbnail ${index + 1}`}
                        onClick={()=>handleThumbnailClick(img)}
                        className='thumbnailimg'/>
                     ))} </div>
            </div>
            <div className="productdetails">
                <div className="productdescription">
                    <h2>Product Name</h2>
                    <span>Product Type</span>
                    <span className="price">Price</span>
                </div>
                <div className="productactions">
                    <div className="colorsselection">
                        <span>Select color :</span>
                        <span className="selected-color-name">{colorNames[selectedColor]}</span>
                        <div className='colors'>
                            <img src={mainwhite} alt="white"
                            className={selectedColor === 'white' ? "selected-color" : ""} 
                            onClick={()=>handleColorChange("white")}
                            />
                            <img src={mainblack} alt="black"
                            className={selectedColor === 'black' ? "selected-color" : ""}
                            onClick={()=> handleColorChange("black")} />
                        </div>
                    </div>
                    <div className="sizeselection">
                        <button onClick={toggleSizeDropdown}>
                            {selectedSize ? `Size : ${selectedSize}`: "Select size"
                            }</button>
                        {sizeDropdown && (
                            <ul className='size-dropdown'>
                                {availableSizes.map((size,index)=>(
                                    <li key={index} onClick={()=>handleSizeSelect(size)}>{size}</li>
                                ))}

                            </ul>
                        )}
                    </div>
                    <div className='quantityselection'>
                        <button onClick={decreaseQuantity}>-</button>
                        <input type="text" onChange={handleInputChange} value={quantity}/>
                        <button onClick={increaseQuantity}>+</button>
                    </div>
                    <div className='cartactions'>
                        <div className='firstaction'>
                            <button>Add to cart</button>
                            <button className='heart-button'><FontAwesomeIcon icon={faHeart} size="2xl" style={{color:"black"}} /></button>
                        </div>
                        <span>Or</span>
                        <button>Buy now</button>

                    </div>
                    <div className='moreinfo'>
                        <span>Description {" "} 
                            <button onClick={()=>setShowDescription(!showDescription)}>
                                {showDescription ? "-" : "+"}
                                </button>
                                </span>
                        {showDescription && (

                            <p className='info-content'>Product Description ..</p>
                        )}
                        <span>Detaills {" "}
                             <button onClick={() =>setShowDetails(!showDetails)}>
                                { showDetails ? "-" : "+"}
                                </button>
                                </span>
                        {showDetails && (

                            <p className='info-content'>Product Details ..</p>
                        )}
                    </div>    
                </div>
            </div>
        </div>
    )
}