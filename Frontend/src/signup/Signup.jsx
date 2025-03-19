import Backgrou from "./Backgrou";
import Coteinscription from "./Coteinscription";
import Socialmedia from "./Socialmedia";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Signup.css';

export default function Signup() {
    const navigate = useNavigate(); // 🔹 Initialize navigation hook

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const response = await fetch("http://127.0.0.1:8000/api/register/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("User registered successfully!");
          localStorage.setItem("user", JSON.stringify(data.user));  // 🔹 Save user info
          navigate("/", { state: { user: data.user } });
      } else {
            setMessage("Error: " + JSON.stringify(data));
        }
    };

    return (
        <div className="photo">
            <Backgrou />
            <div className="cotte">
                <Coteinscription>
                    <h1 className='Creat'>Create your account</h1>
                    <p className="already">
                        Already have an account? 
                        <a href="/login" style={{color:'#3643ba', fontWeight:'400'}}> Login</a>
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="container">
                            <div>
                                <label htmlFor="first_name" className='labe'>First Name :</label><br />
                                <input 
                                    type="text" 
                                    id="first_name" 
                                    name="first_name"
                                    className="box1" 
                                    required 
                                    placeholder='Your First Name'
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className='labe'>Last Name :</label><br />
                                <input 
                                    type="text" 
                                    id="last_name" 
                                    name="last_name"
                                    className="box1" 
                                    required 
                                    placeholder='Your Last Name'
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <p></p>
                        <div>
                            <label htmlFor="email">Email Address :</label><br />
                            <input 
                                type="email" 
                                id="email" 
                                name="email"
                                className="box" 
                                required 
                                placeholder="Email@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <p></p>
                        <div>
                            <label htmlFor="password">Password :</label><br />
                            <input 
                                type="password" 
                                id="password" 
                                name="password"
                                className="box" 
                                required 
                                placeholder="Your Password (6-15 Digits)"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <br />
                        <button className="login" type="submit">
                            Sign UP
                        </button>
                    </form>
                    <p>{message}</p>
                    <p style={{ color: "white", position: "relative", top: "5px" }}>continue with</p> 
                    <div>
                        <Socialmedia />           
                    </div>         
                </Coteinscription>
            </div>
        </div>
    );
}
