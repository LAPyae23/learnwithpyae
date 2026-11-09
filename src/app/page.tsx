import React from 'react';
import LandingNav from './components/LandingNav';
import HeroSection from './components/HeroSection';
import CourseCardsSection from './components/CourseCardsSection';
import FeaturesSection from './components/FeaturesSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <main>
        <HeroSection />
        <CourseCardsSection />
        <FeaturesSection />
        <PricingSection />
        {/* TODO: add TestimonialsSection back once there are real student reviews */}
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
