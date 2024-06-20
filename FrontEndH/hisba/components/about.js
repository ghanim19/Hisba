import React from 'react';
import styles from '../styles/About.module.css';

const About = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>About Us</h1>
      <p className={styles.description}>
        Welcome to our platform! We aim to revolutionize the agricultural industry by connecting farmers directly with consumers, eliminating intermediaries and ensuring that farmers receive fair prices for their produce.
      </p>
      <div className={styles.sectionContainer}>
        <div className={`${styles.section} ${styles.vision}`}>
          <h2 className={styles.subtitle}>Our Vision</h2>
          <p className={styles.text}>
            Providing a Comprehensive Solution for Farmers: The project aims to provide a technological platform that assists farmers in directly marketing their products without the need for intermediaries, thereby enabling them to achieve higher profits and enhance the sustainability of their agricultural businesses.
          </p>
        </div>
        <div className={styles.divider}></div>
        <div className={`${styles.section} ${styles.mission}`}>
          <h2 className={styles.subtitle}>Our Mission</h2>
          <p className={styles.text}>
            Promoting Value-Added Industries and Empowering Women: The project endeavors to promote the concept of value-added industries by transforming surplus agricultural products in the market into products with added value. This initiative aims to enhance the role of women in the agricultural sector and empower them economically.
          </p>
        
        </div>
      </div>
    </div>
  );
};

export default About;
