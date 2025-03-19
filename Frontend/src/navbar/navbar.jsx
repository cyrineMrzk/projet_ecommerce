import { NavLink } from "react-router-dom";
import './navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faUser } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [user, setUser] = useState(null);

    // Retrieve user from localStorage when the component mounts
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login"; // Redirect to login page
    };

    return (
        <div className="navbar">
            <div className="first-nav">
                <h1 className="logo">
                    <NavLink to="/">SportX</NavLink>
                </h1>
                <div className="search">
                    <input type="text" placeholder="Search" />
                    <FontAwesomeIcon icon={faSearch} style={{ color: "#3643ba" }} className="search-icon" />
                </div>
                <nav>
                    <ul>
                        <li>
                            <div className="user-icon-container" onClick={toggleUserMenu}>
                                <FontAwesomeIcon icon={faUser} size="2xl" style={{ color: "#3643ba" }} />
                            </div>
                            {isUserMenuOpen && (
                                <div className="dropdown-menu">
                                    {user ? (
                                        <>
                                            <div className="dropdown-header">
                                                <div className="avatar">{user.first_name.charAt(0)}{user.last_name.charAt(0)}</div>
                                                <div>
                                                    <strong>{user.first_name} {user.last_name}</strong>
                                                    <p>{user.email}</p>
                                                </div>
                                            </div>
                                            <hr />
                                            <NavLink to="/orders" className="menu-item">Mes achats</NavLink>
                                            <NavLink to="/payments" className="menu-item">Informations de paiement</NavLink>
                                            <NavLink to="/account" className="menu-item">Gérer mon compte</NavLink>
                                            <hr />
                                            <button className="logout-btn" onClick={handleLogout}>Se déconnecter</button>
                                        </>
                                    ) : (
                                        <NavLink to="/login" className="menu-item">Se connecter</NavLink>
                                    )}
                                </div>
                            )}
                        </li>
                        <li>
                            <NavLink to="/favorite"><FontAwesomeIcon icon={faHeart} size="2xl" style={{ color: "#3643ba" }} /></NavLink>
                        </li>
                        <li>
                            <NavLink to="/cart"><FontAwesomeIcon icon={faShoppingCart} size="2xl" style={{ color: "#3643ba" }} /></NavLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <hr />
            <div className="second-nav">
                <ul>
                    <li>
                        <NavLink to="/products?category=gym-equipement" className={location.search.includes("category=gym-equipement") ? "active-link" : ""}>Gym Equipment</NavLink>
                    </li>
                    <li>
                        <NavLink to="/products?category=cardio-endurance" className={location.search.includes("category=cardio-endurance") ? "active-link" : ""}>Cardio & Endurance</NavLink>
                    </li>
                    <li>
                        <NavLink to="/products?category=supplements-nutrition" className={location.search.includes("category=supplements-nutrition") ? "active-link" : ""}>Supplements & Nutrition</NavLink>
                    </li>
                    <li>
                        <NavLink to="/products?category=accessoires" className={location.search.includes("category=accessoires") ? "active-link" : ""}>Accessories</NavLink>
                    </li>
                    <li>
                        <a href="/sellerdashboard" style={{ color: '#3643ba' }}>Sell Products</a>
                    </li>
                </ul>
            </div>
        </div>
    );
}
