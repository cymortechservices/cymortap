import { Faq, Features, HowItWorks, Trust, UseCases } from '@/components/HomeSections';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { Navbar } from '@/components/Navbar';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <HowItWorks />
        <Features />
        <UseCases />
        <Trust />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
