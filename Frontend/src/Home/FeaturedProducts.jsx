import ProductCard from '../ProductCard/ProductCard';
import './FeaturedProducts.css';

const featuredProducts = [
    { id: 1, name: "Dumbbell Set",type:'gym equipement',rating:4, price: "4500 DA", image: "dumbell.jpg" },
    { id: 2, name: "Bench Press",type:'gym equipement',rating:3.5, price: "12000 DA", image: "benchpress.jpg" },
    { id: 3, name: "Treadmill",type:'gym equipement',rating:3.5, price: "35000 DA", image: "treadmill.jpg" },
    { id: 4, name: "Kettlebell 16kg",type:'gym equipement',rating:3.5, price: "7000 DA", image: "kettlebell.jpg" },
  ]
export default function FeaturedProducts() {
return(
    <section className="featured-products">
      <h2 className='title'>Best Sellers</h2>
      <div className="products-container">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} imgsrc={product.image} />
        ))}
      </div>
      <button className="see-all-button" >
                See All Products
            </button>
    </section>
  );
}