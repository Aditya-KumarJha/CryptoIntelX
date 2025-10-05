import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import UseCase from "@/components/UseCase";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Page() {
  return (
    <div className="bg-black text-white min-h-screen">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCase />
      <Testimonials />
      <Footer />
    </div>
  );
}
