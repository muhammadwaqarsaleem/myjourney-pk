/**
 * @fileoverview Main responsive footer component for myjourney.pk.
 * Displays brand mission statement, quick navigation links, informational
 * tourism guide pages, emergency contact coordinates, and copyright branding.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Semantic Directory Architecture:
 *    - Organizes navigation hierarchy into 4 thematic columns: About, Quick Links,
 *      Community & Tourism Guide (wired to dedicated informational routes),
 *      and Contact & Emergency Support.
 * 
 * 2. Visual Contrast & Accessibility Compliance:
 *    - High-contrast slate-900 background paired with slate-300 text and
 *      emerald accent highlights meeting WCAG 2.1 Level AA color contrast requirements.
 * 
 * @module components/layout/Footer
 */

import { Link } from 'react-router-dom';
import { Compass, Mail, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About & Brand Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
                <Compass className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="text-xl font-black text-white">
                myjourney<span className="text-emerald-400">.pk</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your trusted companion for exploring the breathtaking valleys, ancient civilizations,
              rich cultural tapestry, and legendary hospitality of Pakistan.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Promoting Safe &amp; Sustainable Tourism</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/destinations" className="hover:text-emerald-400 transition">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-emerald-400 transition">
                  Discover Hotels &amp; Resorts
                </Link>
              </li>
              <li>
                <Link to="/planner" className="hover:text-emerald-400 transition">
                  AI Travel Planner
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-emerald-400 transition">
                  Community Travel Stories
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Community & Tourism Guide (Wired Informational Pages) */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Community &amp; Guide
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/advisory" className="hover:text-emerald-400 transition">
                  Northern Areas Travel Advisory
                </Link>
              </li>
              <li>
                <Link to="/safety" className="hover:text-emerald-400 transition">
                  Safety Guidelines &amp; Weather Alerts
                </Link>
              </li>
              <li>
                <Link to="/etiquette" className="hover:text-emerald-400 transition">
                  Local Etiquette &amp; Heritage Preservation
                </Link>
              </li>
              <li>
                <Link to="/eco-trekking" className="hover:text-emerald-400 transition">
                  Eco-friendly Trekking Practices
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us & Emergency Support */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact &amp; Support
            </h3>
            <p className="text-sm text-slate-400">
              Assisting travelers across all provinces and territories of Pakistan.
            </p>
            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Islamabad, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:support@myjourney.pk" className="hover:underline">
                  support@myjourney.pk
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+92 (51) 800-TOUR</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/contact"
                className="inline-block text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition border border-slate-700 min-h-[40px]"
              >
                Send Us a Message
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {currentYear} myjourney.pk. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>for Pakistan Tourism</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
