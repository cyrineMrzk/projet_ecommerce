import React, { useEffect, useState } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import './FeaturedProducts.css';

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/best-sellers/')
      .then(response => response.json())
      .then(data => {
        console.log(data);  // Log to verify the data structure
        setFeaturedProducts(data);
      })
      .catch(error => console.error('Error fetching best sellers:', error));
  }, []);

  if (featuredProducts.length === 0) {
    return <p>No products found</p>;
  }

  return (
    <section className="featured-products">
      <h2 className='title'>Best Sellers</h2>
      <div className="products-container">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} imgsrc={product.image} />
        ))}
      </div>
      <button className="see-all-button">See All Products</button>
    </section>
  );
}
