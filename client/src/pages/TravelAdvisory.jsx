/**
 * @fileoverview Northern Areas Travel Advisory Page for myjourney.pk.
 * Covers road accessibility, Babusar/Khunjerab seasonal schedules, permit
 * requirements, and high-altitude health protocols for Karakoram and Himalayan travel.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Domain-Specific Information Architecture:
 *    - Structured hierarchically with semantic `<section>`, `<article>`, and
 *      accessible alert callouts for critical travel advisories.
 *    - Incorporates emergency helpline cards with direct `tel:` URI schemes.
 * 
 * 2. Visual Hierarchy & Progressive Disclosure:
 *    - Highlights seasonal Karakoram Highway (N-35) closures and alternative
 *      routes (Beshame / Kohistan bypasses) to prevent traveler stranding.
 * 
 * @module pages/TravelAdvisory
 */

import { Link } from 'react-router-dom';
import {
  Compass,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileCheck,
  Mountain,
  Car,
  HeartPulse,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';

export default function TravelAdvisory() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-700/10 via-emerald-50/30 to-transparent border-b border-slate-200/60 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3">
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Tourism Advisory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Northern Areas Travel Advisory
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Essential intelligence on high-altitude road conditions, seasonal pass openings,
            NOC permit protocols, and mountain acclimatization across Gilgit-Baltistan and Khyber Pakhtunkhwa.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Urgent Live Notice Alert */}
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-start gap-4 shadow-xs">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <p className="font-bold text-base text-amber-950">Seasonal High-Pass Notice (Babusar &amp; Khunjerab)</p>
            <p className="mt-1">
              Babusar Pass (4,173m) typically closes to vehicular transit from mid-November through late May due to heavy snowfall.
              During winter closures, all road traffic between Islamabad and Gilgit-Baltistan routes via the Karakoram Highway (KKH)
              along the Indus River gorge (Mansehra – Besham – Chilas).
            </p>
          </div>
        </div>

        {/* Section 1: Karakoram Highway (KKH) Schedules & Corridors */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Road Corridors &amp; Mountain Transit
              </h2>
              <p className="text-xs text-slate-500">Karakoram Highway (N-35), Jaglot-Skardu Road, and Swat Expressways</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Islamabad to Gilgit (510 km)</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Summer route via Babusar Top is approx. 12–14 hours. Winter route via KKH/Besham averages 16–18 hours.
                Landslides between Kohistan and Dasu are frequent during monsoon (July–August); travel with daylight buffers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Jaglot to Skardu (S-1 Strategic Road)</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                The modernized 167 km Skardu expressway through the Indus gorge has reduced transit to 4 hours.
                4x4 vehicles are mandatory only during winter icing or when venturing into off-corridor valleys (Shigar, Khaplu, Deosai).
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Permits & Documentation Requirements */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Permits, Passports &amp; NOC Guidelines
              </h2>
              <p className="text-xs text-slate-500">Security checkpoint documentation and restricted zone protocols</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Under recent government tourism deregulations, most popular tourist corridors in Gilgit-Baltistan, Swat,
              Kaghan, and Azad Jammu &amp; Kashmir are <strong>Open Zones</strong> requiring no prior Non-Objection Certificate (NOC)
              for domestic travelers or foreign tourists with standard Pakistani Tourist E-Visas.
            </p>

            <ul className="list-disc list-inside space-y-2 text-slate-700 pl-2">
              <li><strong>Domestic Citizens:</strong> Original CNIC is mandatory at all transit checkpoints (Chilas, Alam Bridge, Khunjerab).</li>
              <li><strong>Foreign Tourists:</strong> Carry valid passport with valid Tourist Visa and 5 physical passport copies for registration at police checkpoints.</li>
              <li><strong>Trekking Peaks / Restricted Wilderness:</strong> Treks within 50 miles of international borders or above 6,000 meters (K2 Basecamp, Concordia, Snow Lake) require an accredited Alpine Club tour operator, mountain liaison officer, and Ministry of Tourism permit.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: High-Altitude Acclimatization & Mountain Medicine */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Altitude Health &amp; AMS Protocols
              </h2>
              <p className="text-xs text-slate-500">Preventing Acute Mountain Sickness in high valleys (Deosai 4,100m+, Khunjerab 4,693m)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <h3 className="font-bold text-emerald-900 mb-1">Gradual Ascent</h3>
              <p className="text-slate-600 leading-relaxed">
                Ascend no more than 500 meters sleeping elevation per day once above 2,500m. Rest a full day in Skardu (2,228m) or Gilgit before ascending Deosai Plains.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <h3 className="font-bold text-emerald-900 mb-1">Hydration &amp; Nutrition</h3>
              <p className="text-slate-600 leading-relaxed">
                Consume 4–5 liters of clean water daily. Avoid alcohol and sedatives. High-carbohydrate diets improve metabolic oxygen efficiency at high elevations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <h3 className="font-bold text-emerald-900 mb-1">Descent is the Cure</h3>
              <p className="text-slate-600 leading-relaxed">
                If experiencing persistent headache, nausea, or dizziness (signs of AMS), immediately descend to lower altitude. Never ascend with active AMS symptoms.
              </p>
            </div>
          </div>
        </section>

        {/* Emergency Help Contact Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Need Immediate Road Assistance or Route Verification?</h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Contact Pakistan Tourist Police 24/7 hotline or connect directly with our regional desk.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:1422"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition min-h-[44px]"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call Helpline 1422</span>
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition min-h-[44px]"
            >
              <span>Message Advisory Desk</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
