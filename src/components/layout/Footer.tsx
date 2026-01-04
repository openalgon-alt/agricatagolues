import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';
import mainLogo from '@/assets/main-logo.png';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-magazine py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="block mb-4">
              <img
                src={mainLogo}
                alt="AgriCatalogues Logo"
                className="h-16 w-auto object-contain bg-white rounded-lg p-1"
              />
            </Link>
            <p className="text-sm opacity-80 leading-relaxed">
              A peer-reviewed academic magazine dedicated to advancing agricultural research
              and sustainable farming practices worldwide.
            </p>
            <p className="mt-4 text-sm font-semibold text-amber-200">
              ISSN: 3108-124X
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Home</Link></li>
              <li><Link to="/current-issue" className="opacity-80 hover:opacity-100 transition-opacity">Current Issue</Link></li>
              <li><Link to="/archives" className="opacity-80 hover:opacity-100 transition-opacity">Archives</Link></li>
              <li><Link to="/shop" className="opacity-80 hover:opacity-100 transition-opacity">Shop</Link></li>
              <li><Link to="/membership" className="opacity-80 hover:opacity-100 transition-opacity">Membership</Link></li>
              <li><Link to="/editorial-board" className="opacity-80 hover:opacity-100 transition-opacity">Editorial Board</Link></li>
            </ul>
          </div>

          {/* For Authors */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">For Authors</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/publish-with-us" className="opacity-80 hover:opacity-100 transition-opacity">Publish with Us</Link></li>
              <li><Link to="/guidelines" className="opacity-80 hover:opacity-100 transition-opacity">Submission Guidelines</Link></li>
              <li><Link to="/guidelines#ethics" className="opacity-80 hover:opacity-100 transition-opacity">Publication Ethics</Link></li>
              <li><Link to="/guidelines#review" className="opacity-80 hover:opacity-100 transition-opacity">Peer Review Process</Link></li>
              <li><Link to="/contact" className="opacity-80 hover:opacity-100 transition-opacity">Contact Editorial</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 opacity-80" />
                <span className="opacity-80">editor@agricatalogues.in</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 opacity-80" />
                <span className="opacity-80">+91 9148942104</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 opacity-80" />
                <span className="opacity-80">
                  Saddahalli, Palicherlu,<br />
                  Sidlaghatta- Chikkaballapur,<br />
                  562105, Karnataka
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
          <p>© {currentYear} Agri Catalogues. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/guidelines#ethics" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link to="/guidelines" className="hover:opacity-100 transition-opacity">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
