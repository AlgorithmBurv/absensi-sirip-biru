import React from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import AboutUs from "../components/landing/AboutUs";
import Course from "../components/landing/Course";
import Coach from "../components/landing/Coach";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans overflow-x-hidden scroll-smooth">
      <Navbar />
      
      <main>
        <Hero />
        <AboutUs />
        <Course />
        <Coach />
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}