
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Map, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      const children = heroRef.current.querySelectorAll('.animate-on-scroll');
      children.forEach((child) => observer.observe(child));
    }

    return () => {
      if (heroRef.current) {
        const children = heroRef.current.querySelectorAll('.animate-on-scroll');
        children.forEach((child) => observer.unobserve(child));
      }
    };
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom right, #f8fafc, #f0f9ff)'
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 rounded-full bg-blue-50/80 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-indigo-50/50 blur-3xl" />
        <div className="grid grid-cols-12 grid-rows-6 gap-4 absolute inset-0 opacity-5">
          {Array.from({ length: 12 * 6 }).map((_, i) => (
            <div key={i} className="border border-gray-200"></div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600 mb-6 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700">
              <Clock size={14} className="mr-2" />
              <span>FMCSA Hours of Service Compliant</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">
              Smart Trip Planning for <span className="text-primary">Professional Drivers</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-200">
              Plan compliant routes, generate accurate ELD logs, and stay on schedule with our intelligent trip planning tool designed specifically for CMV drivers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-300">
              <Button asChild size="lg" className="rounded-md py-6 text-md font-medium hover-lift">
                <Link to="/trip-planner">
                  Start Planning <ChevronRight size={18} className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-md py-6 text-md font-medium hover-lift">
                <Link to="/log-generator">
                  Generate Logs <FileText size={18} className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="hidden md:block animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-400">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden glassmorphism shadow-xl animate-float">
              <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[2px]"></div>
              <img 
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Truck driver planning a route" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <div className="glassmorphism rounded-lg p-4 max-w-xs">
                  <div className="flex items-center mb-3">
                    <Map size={18} className="text-primary mr-2" />
                    <div className="text-sm font-medium text-gray-900">Route Optimization</div>
                  </div>
                  <div className="text-xs text-gray-600">Atlanta, GA to Chicago, IL</div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <div className="text-xs text-gray-600">11h driving time</div>
                    <div className="text-xs font-medium text-primary">HOS Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex justify-center w-full">
          <a 
            href="#features" 
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 border border-gray-200 shadow-sm hover:shadow-md transition-all animate-bounce"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-4 h-4 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
