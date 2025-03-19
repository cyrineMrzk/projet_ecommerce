import { useEffect, useState } from "react";
import Herosection from './Herosection';
import FeaturedProducts from './FeaturedProducts';
import Featuredauctions from './Featuredauctions';
import Services from './Services';

export default function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));  // Retrieve user data
        }
    }, []);

    return (
        <div>
            {user ? <h1>Welcome, {user.first_name} {user.last_name}!</h1> : <h1>Welcome!</h1>}
            <Herosection />
            <FeaturedProducts />
            <Featuredauctions />
            <Services />
        </div>
    );
}
