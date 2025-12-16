import React from "react";
import styles from "./Header.module.css";

const Header = () => {
    return (
        <nav className={styles.header}>
            <div className={styles.headerContainer}>
                <div className={styles.logo}>
                    CLOUD CLUB
                </div>
                <ul className={styles.navMenu}>
                    <li><a href="#management">Management</a></li>
                    <li><a href="#faq">FAQ</a></li>
                </ul>
            </div>
        </nav>
    );
};

export default Header;
