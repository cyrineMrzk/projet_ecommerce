import './App.css';
import { Route,Routes,useLocation } from 'react-router-dom';
import Signup from './signup/Signup';
import Login from './Login/Login';
import Home from './Home/Home';
import Contactus from './Contactus/Contactus';
import Products from './Products/Products';
import './App.css';
import Cart from './Cart/Cart';
import Favorite from './Favorite/Favorite';
import Navbar from './navbar/navbar';
import Footer from './footer/Footer';
import ProductDetails from './ProductPage/Productdetaills';
import Auctionpage from './AuctionPage/AuctionPage';
import AboutUs from './AboutUs/AboutUs';
import Faq from './FAQ/Faq';
import PrivacyPolicy from './Privacy/Privacy';
import TermsAndConditions from './TermsandCond/TermsandCond';
import OrderTracking from './OrderTracking/OrderTracking';
import SellProducts from './SellProducts/SellProducts';
import SellerDashboard from './SellerDashboard/SellerDashboard';
import Auctions from './Auctions/Auctions';
function App() {
  const location = useLocation();
  const shouldFooterShow = !location.pathname.includes('login') && !location.pathname.includes('signup');
  const shouldShowNavBar = !location.pathname.includes('login') && !location.pathname.includes('signup');
  return (
   <>
    {shouldShowNavBar && <Navbar/> }
        
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="contactus" element={<Contactus />} />

    <Route path="login" element={<Login/>} />
    <Route path="signup" element={<Signup/>} />
    <Route path="products" element={<Products/>} />
    <Route path='products/:id' element={<ProductDetails/>} />
    <Route path="cart" element={<Cart/>} />
    <Route path="favorite" element={<Favorite/>} />
    <Route path='auctions' element={<Auctions/>}/>
    <Route path="auctions/auction" element={<Auctionpage/>}/>
    <Route path='aboutus' element={<AboutUs/>}/>
    <Route path='/faq' element={<Faq/>}/>
    <Route path='/privacy&policy' element={<PrivacyPolicy/>}/>
    <Route path='/terms&conditions' element={<TermsAndConditions/>}/>
    <Route path='ordertracking' element={<OrderTracking/>}/>
    <Route path='sellerdashboard' element={<SellerDashboard/>}/>
    <Route path='sellproducts' element={<SellProducts/>}/>
  </Routes>
    {shouldFooterShow && <Footer/>}
  </>
  );
}

export default App;
