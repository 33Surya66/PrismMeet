
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Architecture from '@/components/Architecture';
import Roadmap from '@/components/Roadmap';
import Analytics from '@/components/Analytics';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black">
      <Header />
      <Hero />
      <Features />
      <Architecture />
      <Analytics />
      <Roadmap />
      <Footer />
    </div>
  );
};

export default Index;
