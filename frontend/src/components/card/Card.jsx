/** Panel with an optional header row. Wrap tables in <Card flush>. */
const Card = ({ title, subtitle, actions, flush = false, children, className = "" }) => (
  <section className={`card ${className}`.trim()}>
    {(title || actions) && (
      <header className="card__header">
        <div>
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="u-flex u-gap-2">{actions}</div>}
      </header>
    )}
    <div className={`card__body${flush ? " card__body--flush" : ""}`}>{children}</div>
  </section>
);

export default Card;
