import ProductInfo from "./Productinfo";
import RelatedProduct from "./relatedproduct";
import Reviews from "./reviews";
import { useLocation } from "react-router-dom";

export default function ProductDetails() {
    const location = useLocation();
    const product = location.state?.product;
    
    return (
        <div>
            <ProductInfo product={product} />
            <RelatedProduct />
            <Reviews />
        </div>
    );
}
