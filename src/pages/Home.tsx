import { Link } from "react-router-dom";
import { useAuth } from "../auth/authService";

export default function Home() {
  const { account, roles } = useAuth();
  const nombre = (account?.name ?? account?.username ?? "Usuario").split(" ")[0];

  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-hero__content">
          <span className="store-eyebrow"><span className="store-eyebrow__line" /> TU ESPACIO / PEDIDOS360</span>
          <h1>Bienvenido,<br /><em>{nombre}.</em></h1>
          <p>Todo lo que necesitas para comprar, organizar y seguir tus pedidos, en un solo lugar.</p>
          <div className="home-hero__actions">
            <Link to="/productos" className="home-primary-link">Explorar productos <span aria-hidden="true">↗</span></Link>
            <Link to="/pedidos" className="home-secondary-link">Ver mis pedidos <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="home-hero__graphic" aria-hidden="true"><div className="home-hero__ring home-hero__ring--outer" /><div className="home-hero__ring home-hero__ring--inner" /><span>360<span>°</span></span><small>MOVE FORWARD</small></div>
      </div>
      <div className="home-section-title"><span className="store-section-kicker">ACCESOS RÁPIDOS</span><h2>Tu día, más simple<span className="store-section-dot">.</span></h2></div>
      <div className="home-actions">
        <Link className="home-action" to="/productos"><span className="home-action__number">01 / EXPLORAR</span><span className="home-action__icon" aria-hidden="true">↗</span><strong>Descubre el catálogo</strong><p>Encuentra los productos que necesitas y arma tu próxima compra.</p><span className="home-action__bottom">Ir a la tienda <span aria-hidden="true">→</span></span></Link>
        <Link className="home-action" to="/pedidos"><span className="home-action__number">02 / SEGUIMIENTO</span><span className="home-action__icon" aria-hidden="true">↗</span><strong>Consulta tus pedidos</strong><p>Revisa la información y el estado de tus solicitudes.</p><span className="home-action__bottom">Ver pedidos <span aria-hidden="true">→</span></span></Link>
      </div>
      <div className="home-footnote"><span className="home-footnote__dot" /> Sesión iniciada como {account?.username ?? "usuario"}{roles.length ? ` · ${roles.join(" / ")}` : ""}</div>
    </section>
  );
}
