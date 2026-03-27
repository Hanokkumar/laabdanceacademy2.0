import React from 'react';
import HeroSlider from '../components/HeroSlider';
import AboutSection from '../components/AboutSection';
import DanceSchool from '../components/DanceSchool';
import EventsSection from '../components/EventsSection';
import GallerySection from '../components/GallerySection';
import InstructorSection from '../components/InstructorSection';
import CTABanner from '../components/CTABanner';
import ClassScheduleSection from '../components/ClassScheduleSection';
import BlogSection from '../components/BlogSection';
import TestimonialSection from '../components/TestimonialSection';
import PartnersSection from '../components/PartnersSection';

const HomePage = () => {
  return (
    <>
      <HeroSlider />
      <AboutSection />
      <DanceSchool />
      <EventsSection />
      <GallerySection />
      <InstructorSection />
      <CTABanner />
      <ClassScheduleSection />
      <BlogSection />
      <TestimonialSection />
      <PartnersSection />
    </>
  );
};

export default HomePage;
