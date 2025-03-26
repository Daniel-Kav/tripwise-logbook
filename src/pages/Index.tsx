
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { FileText, Route, Shield, BarChart, ChevronRight } from 'lucide-react';

const Index = () => {
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elements = entry.target.querySelectorAll('.animate-on-scroll');
          elements.forEach((el, index) => {
            setTimeout(() => {
              el.classList.add('opacity-100', 'translate-y-0');
              el.classList.remove('opacity-0', 'translate-y-10');
            }, index * 100);
          });
        }
      });
    }, observerOptions);
    
    if (testimonialsRef.current) observer.observe(testimonialsRef.current);
    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    
    return () => {
      if (testimonialsRef.current) observer.unobserve(testimonialsRef.current);
      if (howItWorksRef.current) observer.unobserve(howItWorksRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        <Hero />
        <Features />
        
        {/* How It Works Section */}
        <section className="py-16 sm:py-24 bg-white" ref={howItWorksRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600">
                Our platform simplifies trip planning and ELD logging for professional drivers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Route size={32} />,
                  title: "Enter Your Trip Details",
                  description: "Input your current location, pickup point, destination, and available driving hours."
                },
                {
                  icon: <Shield size={32} />,
                  title: "Get HOS-Compliant Routes",
                  description: "Our system calculates the optimal route with required breaks and rest stops based on FMCSA regulations."
                },
                {
                  icon: <FileText size={32} />,
                  title: "Generate ELD Logs",
                  description: "One-click creation of accurate Electronic Logging Device (ELD) records for your entire trip."
                }
              ].map((step, index) => (
                <div 
                  key={index} 
                  className="text-center p-6 rounded-lg bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all animate-on-scroll opacity-0 translate-y-10"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild size="lg" className="rounded-md py-6 text-md font-medium hover-lift">
                <Link to="/trip-planner">
                  Try It Now <ChevronRight size={18} className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 sm:py-24 bg-gray-50" ref={testimonialsRef}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-600 mb-6 animate-on-scroll opacity-0 translate-y-10">
                <BarChart size={14} className="mr-2" />
                <span>Trusted by Professional Drivers</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 animate-on-scroll opacity-0 translate-y-10">
                What Drivers Are Saying
              </h2>
              <p className="text-xl text-gray-600 animate-on-scroll opacity-0 translate-y-10">
                Hear from the professionals who use our platform every day.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "This tool has completely transformed how I plan my trips. The ELD logs are always accurate and save me so much time.",
                  name: "Michael Rodriguez",
                  title: "Owner-Operator, 15 years experience"
                },
                {
                  quote: "I never have to worry about HOS violations anymore. The route planning with mandatory breaks keeps me compliant and safe.",
                  name: "Sarah Johnson",
                  title: "Long-haul driver, 8 years experience"
                },
                {
                  quote: "As a fleet manager, this platform has improved our efficiency and compliance rates across all our drivers.",
                  name: "David Wilson",
                  title: "Fleet Manager, J&B Logistics"
                }
              ].map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-on-scroll opacity-0 translate-y-10"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 text-amber-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.title}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Ready to Streamline Your ELD Compliance?
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of professional drivers who trust our platform for their trip planning and ELD logs.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" className="rounded-md py-6 text-md font-medium hover-lift min-w-[200px]">
                  <Link to="/trip-planner">
                    Start Planning
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-md py-6 text-md font-medium hover-lift min-w-[200px]">
                  <Link to="/log-generator">
                    Generate Logs
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
