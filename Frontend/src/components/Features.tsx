
import React, { useEffect, useRef } from 'react';
import { Clock, Map, FileText, Shield, Truck, BarChart, Route, Calendar } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

const FeatureCard = ({ icon, title, description, delay }: FeatureCardProps) => (
  <div 
    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 feature-card opacity-0"
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="w-12 h-12 flex items-center justify-center rounded-md bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.feature-card');
            elements.forEach(el => {
              el.classList.add('opacity-100', 'translate-y-0');
              el.classList.remove('opacity-0', 'translate-y-10');
            });
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

  const features = [
    {
      icon: <Route size={24} />,
      title: "Intelligent Route Planning",
      description: "Optimize your routes considering distance, traffic, and required breaks to maximize efficiency.",
      delay: 0
    },
    {
      icon: <Clock size={24} />,
      title: "HOS Compliance",
      description: "Stay compliant with FMCSA Hours of Service regulations, including driving limits and required breaks.",
      delay: 100
    },
    {
      icon: <Map size={24} />,
      title: "Rest Stop Recommendations",
      description: "Get suggestions for optimal rest locations based on your route and required break times.",
      delay: 200
    },
    {
      icon: <FileText size={24} />,
      title: "Automatic ELD Logs",
      description: "Generate accurate Electronic Logging Device (ELD) logs based on your planned trips and actual driving.",
      delay: 300
    },
    {
      icon: <Shield size={24} />,
      title: "Regulation Updates",
      description: "Stay up-to-date with the latest FMCSA regulations and compliance requirements.",
      delay: 400
    },
    {
      icon: <Calendar size={24} />,
      title: "Trip Scheduling",
      description: "Plan your trips in advance with accurate time estimations and scheduling tools.",
      delay: 500
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-24 bg-gray-50">
      <div ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Features designed for professional drivers
          </h2>
          <p className="text-xl text-gray-600">
            Our comprehensive set of tools helps you plan, track, and optimize your trips while maintaining regulatory compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
