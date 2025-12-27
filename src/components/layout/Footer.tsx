import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-magazine py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display text-xl font-bold">AgriScience</span>
                <span className="block text-xs opacity-80 -mt-1">Research Journal</span>
              </div>
            </Link>
            <p className="text-sm opacity-80 leading-relaxed">
              A peer-reviewed academic journal dedicated to advancing agricultural research 
              and sustainable farming practices worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="opacity-80 hover:opacity-100 transition-opacity">Home</Link></li>
              <li><Link to="/current-issue" className="opacity-80 hover:opacity-100 transition-opacity">Current Issue</Link></li>
              <li><Link to="/archives" className="opacity-80 hover:opacity-100 transition-opacity">Archives</Link></li>
              <li><Link to="/editorial-board" className="opacity-80 hover:opacity-100 transition-opacity">Editorial Board</Link></li>
            </ul>
          </div>

          {/* For Authors */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">For Authors</h4>
            <ul className="space-y-2 text-sm">
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
                <span className="opacity-80">editor@agrisciencejournal.org</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 opacity-80" />
                <span className="opacity-80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 opacity-80" />
                <span className="opacity-80">
                  123 Research Avenue<br />
                  Agricultural Campus<br />
                  University City, ST 12345
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
          <p>© {currentYear} AgriScience Research Journal. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/guidelines#ethics" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link to="/guidelines" className="hover:opacity-100 transition-opacity">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
