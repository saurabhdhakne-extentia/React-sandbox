import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './SlidingAnimation.module.css';

interface Location {
  location: string;
  content: string;
  cta_text: string;
  image: string;
}


interface SlidingAnimationProps {
  slidesRef: React.RefObject<(HTMLDivElement | null)[]>;
  slides: Location[];
}

const SlidingAnimation: React.FC<SlidingAnimationProps> = ({
  slidesRef,
  slides,
}) => {

  const bgImages = [
    '/images/OurConstellationSection/wrapper.png',
    '/images/OurConstellationSection/1856.jpg',
    '/images/OurConstellationSection/1866.jpg',
    '/images/OurConstellationSection/2042.jpg',
    '/images/OurConstellationSection/2125.jpg',
    '/images/OurConstellationSection/2814.jpg'
  ];

  useEffect(() => {
    return () => {
      // Cleanup GSAP animations
      gsap.killTweensOf(slidesRef.current);
    };
  }, []);

  useEffect(() => {
    // Re-run this when slides change
    slidesRef.current = []; // Clear previous refs

    slides.forEach((_, i) => {
      const el = slidesRef.current[i];
      if (el) {
        gsap.set(el, {
          yPercent: i === 0 ? 0 : 100
        });
      }
    });
  }, [slides]); // Trigger on slides change


  return (
    <div className={styles.container}>
      {slides.map((text, index) => (
        <div
          key={index}
          ref={el => { slidesRef.current[index] = el; }}
          className={styles.slide}
          style={{ backgroundImage: `url(${text.image || 'images/OurConstellationSection/2814.jpg' })` }}
        >
          <span className={styles.slideText}>
            {/* {text} */}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SlidingAnimation;
