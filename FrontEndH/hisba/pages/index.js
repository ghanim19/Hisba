// pages/index.js

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import TopRatedStores from '../components/TopRatedStores';
import MostOrderedProducts from '../components/MostOrderedProducts';
import DebugSession from '../components/DebugSession';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import styles from '../styles/Home.module.css';
import About from '../components/about';

const HomePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session.user.role === 'admin') {
      router.push('/adminindex');
    }
  }, [status, session]);

  const slides = [
    { id: 1, src: '/image1.png', caption: "Discover the best stores", title: "Explore", link: "#2" },
    { id: 2, src: '/image2.png', caption: "Explore top products", title: "Innovate", link: "#3" },
    { id: 3, src: '/image3.png', caption: "Join our community", title: "Join Us", link: "/register" }
  ];

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        className={styles.slider}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <img src={slide.src} alt={`Slide ${slide.id}`} className={styles.slideImage} />
            <div className={styles.slideOverlay}></div>
            <div className={styles.slideCaption}>
              <h2>{slide.title}</h2>
              <p>{slide.caption}</p>
              <a href={slide.link} className={styles.slideButton}>
                <div className={styles.arrows}>
                  <div className={styles.arrow}></div>
                </div>
              </a>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div id="1">
        <DebugSession />
      </div>
      <div id="2">
        <TopRatedStores />
      </div>
      <div id="3">
        <MostOrderedProducts />
      </div>
      <About />
    </div>
  );
};

export default HomePage;
