'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SlidingAnimation from './SlidingAnimation';
import { getTranslations } from '@/utils/translation';

interface OurConstellationSectionProps {
  lang: string;
}

interface Location {
  location: string;
  content: string;
  cta_text: string;
  image: string;
}

const OurConstellationSection: React.FC<OurConstellationSectionProps> = ({ lang }) => {
  const tl = useRef<gsap.core.Timeline | null>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [locations, setLocations] = useState<Location[]>([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
  getTranslations(lang).then((tr) => {
    const newLocations = tr.our_constellation_section.locations || [];
    setLocations(newLocations);
    setTitle(tr.our_constellation_section.title || "");
    // Reset to first slide when new data loads
    setCurrentSlide(0);
  });
}, [lang]);

  const animateToSlide = (nextSlide: number) => {
     if (locations.length === 0) return;
    const currentEl = slidesRef.current[currentSlide];
    const nextEl = slidesRef.current[nextSlide];
    if (!currentEl || !nextEl) return;

    const isForward = nextSlide > currentSlide;

    if (isForward) {

      // Forward: current goes up, next comes from bottom
      // gsap.set(nextEl, { yPercent: 100 });
      gsap.set(nextEl, { yPercent: 100, scale: 1 })

      const tl = gsap.timeline();

      tl.to(currentEl, {
        yPercent: -50,
        scale: 0.8,
        duration: 1.2,
        // ease: 'back.in(1.7)'
        ease: 'power2.inOut'
      })
        .to(
          nextEl,
          {
            yPercent: 0,
            duration: 1.2,
            // ease: 'back.out(1.7)'
            ease: 'power2.out'
          },
          0
        )
        .eventCallback('onComplete', () => {
          // gsap.set(currentEl, {scale: 1})
          setCurrentSlide(nextSlide);
        });
    } else {
      // Backward: current goes down, previous comes from top
      gsap.set(currentEl, { yPercent: 0 }); // Ensure current is at 0 (usually already is)

      gsap.set(nextEl, { yPercent: -50 });  // Previous slide starts above

      const tl = gsap.timeline();

      tl.to(currentEl,
        {
          yPercent: 100,
          duration: 1.2,
          // ease: 'back.in(1.7)' 
          ease: 'power2.inOut'
        })
        .to(nextEl,
          {
            yPercent: 0,
            scale: 1,
            duration: 1.2,
            ease: 'power2.out'
          },
          0
        )
        .eventCallback('onComplete', () => {
          setCurrentSlide(nextSlide);
        });
    }
  };

  const go = (direction: 'prev' | 'next') => {
    console.log(direction)
    console.log(locations)
    if (direction === 'next' && currentSlide < locations.length - 1) {
      animateToSlide(currentSlide + 1);
    } else if (direction === 'prev' && currentSlide > 0) {
      animateToSlide(currentSlide - 1);
    }
  };
  return (
    <div className='container'>
      <div className="row p-5">
        <div className="col">
          <h1 className='fw-bolder d-flex align-items-center'>{title} {currentSlide} </h1>
          <div className="d-flex">
            <button onClick={() => go('prev')} className="btn border border-dark rounded-0 d-flex align-items-center justify-content-center px-3 py-3">
              <ChevronLeft size={16} className="me-1" />
            </button>
            <button onClick={() => go('next')} className="btn border border-dark rounded-0 d-flex align-items-center justify-content-center px-3 py-3">
              <ChevronRight size={16} className="ms-1" />
            </button>
          </div>
        </div>
        <div className='col h4'>
          <h2 className='fw-bold'>Abu Dhabi</h2>
          <p>
            Opened in 1959, the Guggenheim New York—designed by Frank Lloyd Wright—features a spiral ramp and a collection of modern and contemporary art, including works by Kandinsky and Picasso.
          </p>
          <a href={"/"} className="d-flex align-items-bottom gap-2 mt-4">
            <span className="fw-bolder ">{"visit website"}</span>
            <ArrowRight size={18} />
          </a>
        </div>

      </div>
      <div className="row">
        <SlidingAnimation
          slidesRef={slidesRef}
          slides={locations}
        />
      </div>
    </div>
  );
};

export default OurConstellationSection;
