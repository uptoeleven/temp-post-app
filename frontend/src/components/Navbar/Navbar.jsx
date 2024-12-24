import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLogout } from "../../hooks/useLogout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout, logoutError } = useLogout();
  const { user } = useAuthContext();
  const location = useLocation();
  const isHomepage = location.pathname === "/";
  const navigate = useNavigate();
  const [logoutMsg, setLogoutMsg] = useState("");

  const handleClick = () => {
    logout();
    navigate("/login");
    setLogoutMsg("Logged out");
  };

  const logoutIcon = (
    <FontAwesomeIcon
      icon={faRightFromBracket}
      className={styles.navLogoutIcon}
    />
  );

  // Clean up prevents menu close button displaying in Navbar after logout
  useEffect(() => {
    if (!user) {
      setMenuOpen(false);
    }
  }, [user]);

  return (
    <>
      {/* Visually hidden aria-live message*/}
      <div aria-live="polite" className="aria-live-hidden">
        {logoutMsg}
      </div>

      <nav className={styles.navbarContainer}>
        {user ? (
          isHomepage ? (
            <h1>ONLINE POST MANAGER</h1>
          ) : (
            <Link
              to="/"
              className={styles.link}
              aria-label="Go to dashboard homepage">
              <h1>ONLINE POST MANAGER</h1>
            </Link>
          )
        ) : (
          <h1>ONLINE POST MANAGER</h1>
        )}
        <span className={styles.navList}>
          {user && <span className={styles.userEmail}>{`${user.email}`}</span>}
        </span>
        {user && (
          <button
            className={styles.navMenu}
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
            aria-expanded={menuOpen}
            aria-controls="navigation"
            aria-label="Menu"
           >
            <span></span>
            <span></span>
            <span></span>
          </button>
        )}
        <ul className={menuOpen ? styles.open : ""}>
          {user && (
            <>
              <li className={styles.navList} id="navigation">
                <button
                  onClick={handleClick}
                  className={styles.navLogoutButton}
                  aria-label="Log out button">
                  {logoutIcon} Log Out
                </button>
              </li>
            </>
          )}
        </ul>
        {menuOpen && user && (
          <button
            className={styles.closeNavMenu}
            onClick={() => {
              setMenuOpen(false);
            }}
            aria-label="Close menu">
            X
          </button>
        )}
        {logoutError && <div className="error">{logoutError}</div>}
      </nav>
    </>
  );
};

export default Navbar;
