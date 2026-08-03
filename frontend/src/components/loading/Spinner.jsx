/** size: sm | md | lg */
const Spinner = ({ size = "md", label = "Loading" }) => (
  <span className={`spinner spinner--${size}`} role="status" aria-label={label} />
);

export default Spinner;
