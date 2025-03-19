import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faUsers, faAppleAlt, faTruck, faGifts, faUndo, faCreditCard } from "@fortawesome/free-solid-svg-icons";
import "./Services.css";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons/faClipboardList";
export default function Services() {
    const services = [
        { icon: faTruck, title: "Livraison Rapide", description: "Recevez vos équipements sportifs rapidement et en toute sécurité." },
        { icon: faCreditCard, title: "Paiement Sécurisé", description: "Plusieurs options de paiement sécurisé disponibles." },
        { icon: faUndo, title: "Retours Faciles", description: "Retournez vos articles sous 14 jours si vous n'êtes pas satisfait." },
        { icon: faGifts, title: "Offres et Réductions", description: "Profitez de promotions exclusives et d'un programme de fidélité." }
    ];

    return (
        <section className="services">
            <h2>Our Services</h2>
            <div className="services-container">
                {services.map((service,index) => (
                    <div key={index} className="service-card">
                        <FontAwesomeIcon icon={service.icon}/>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                    </div>
                ))}
            </div>
        </section>

    );
}