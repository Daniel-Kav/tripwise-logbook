
import { Link } from 'react-router-dom';
import { Truck, Github, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 text-primary font-semibold text-lg mb-4">
              <Truck size={24} className="text-primary" />
              <span>ELD Trip Planner</span>
            </Link>
            <p className="text-gray-600 max-w-md">
              Helping commercial motor vehicle drivers plan trips and generate accurate ELD logs while 
              maintaining compliance with FMCSA regulations.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="mailto:info@eldtripplanner.com" className="text-gray-400 hover:text-primary transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/trip-planner" className="text-gray-600 hover:text-primary transition-colors">Trip Planner</Link>
              </li>
              <li>
                <Link to="/log-generator" className="text-gray-600 hover:text-primary transition-colors">Log Generator</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://www.fmcsa.dot.gov/regulations/hours-of-service" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  FMCSA Hours of Service
                </a>
              </li>
              <li>
                <a href="https://www.fmcsa.dot.gov/hours-service/elds/electronic-logging-devices" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-primary transition-colors">
                  ELD Information
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-6">
          <p className="text-sm text-gray-500 text-center">
            © {currentYear} ELD Trip Planner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
