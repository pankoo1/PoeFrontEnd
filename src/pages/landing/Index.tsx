import React from 'react';
import LandingNavbar from '@/components/landing/LandingNavbar';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingContactForm from '@/components/landing/LandingContactForm';
import LandingFooter from '@/components/landing/LandingFooter';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingContactForm />
      <LandingFooter />
    </div>
  );
};

export default Index;
