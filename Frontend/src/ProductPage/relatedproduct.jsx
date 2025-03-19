import ProductCard from "../ProductCard/ProductCard";
import dumbell from '../images/dumbell.jpg';
import './relatedProduct.css';
export default function RelatedProduct() {
    return (
        <div className="related-product">
            <h2 className="title">related product</h2>
            <div className="products-container">
            <ProductCard product={{
                name: 'Dumbell 5Kg',
                type: 'Gym Equipement',
                rating: 4.5,
                price: 2000,
            
            }
            }
            imgsrc={dumbell} />
            <ProductCard product={{
                name: 'Dumbell 5Kg',
                type: 'Gym Equipement',
                rating: 4.5,
                price: 2000,
            
            }
            }
            imgsrc={dumbell} />
            <ProductCard product={{
                name: 'Dumbell 5Kg',
                type: 'Gym Equipement',
                rating: 4.5,
                price: 2000,
            
            }
            }
            imgsrc={dumbell} />
            <ProductCard product={{
                name: 'Dumbell 5Kg',
                type: 'Gym Equipement',
                rating: 4.5,
                price: 2000,
            
            }
            }
            imgsrc={dumbell} />
            </div>
        </div>
    )
}