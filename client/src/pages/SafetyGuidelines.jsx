/**
 * @fileoverview Safety Guidelines & Weather Alerts Page for myjourney.pk.
 * Covers natural hazard mitigation (flash floods, avalanches, seismic activity),
 * weather forecasting resources, and national emergency contacts (1122, 1422).
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Emergency Human Factors & Immediate Accessibility:
 *    - Prominently positions critical emergency numbers (1122 Rescue, 1422 Tourist Police,
 *      130 National Highway Motorway Police) at the top of the interface.
 *    - Clickable `tel:` anchor points ensure rapid mobile dialing in high-stress scenarios.
 * 
 * 2. Glacial Lake Outburst Floods (GLOF) & Monsoon Safety:
 *    - Outlines scientific hazard vectors affecting mountain valleys (Chitral, Hunza,
 *      Kumrat, Swat) during glacial melt cycles.
 * 
 * @module pages/SafetyGuidelines
 */

import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  PhoneCall,
  CloudRain,
  Waves,
  MountainSnow,
  Radio,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';

const EMERGENCY_SERVICES = [
  {
    name: 'Rescue 1122',
    number: '1122',
    purpose: 'Paramedic, fire rescue, and road traffic accident extraction nationwide.',
    highlight: true,
  },
  {
    name: 'Tourist Police Helpline',
    number: '1422',
    purpose: 'Dedicated 24/7 tourist assistance, route escorts, and dispute resolution.',
    highlight: true,
  },
  {
    name: 'National Highway & Motorway Police (NH&MP)',
    number: '130',
    purpose: 'Expressway breakdown recovery, landslide clearances, and highway emergency response.',
    highlight: false,
  },
  {
    name: 'NDMA Emergency Operations Center',
    number: '051-111-157-157',
    purpose: 'National Disaster Management weather warnings and flood alert coordination.',
    highlight: false,
  },
];

export default function SafetyGuidelines() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-700/10 via-emerald-50/30 to-transparent border-b border-slate-200/60 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
            <span>Emergency &amp; Hazard Preparedness</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Safety Guidelines &amp; Weather Alerts
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Essential protocols for managing mountain weather fluctuations, flash flood cautions,
            winter avalanche risks, and nationwide emergency rescue channels.
          </p>
        </div>
      </section>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Emergency Helpline Cards Grid */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-700" />
            <span>Emergency Helplines (Toll-Free Nationwide)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {EMERGENCY_SERVICES.map((srv) => (
              <div
                key={srv.number}
                className={`p-5 rounded-3xl border transition flex flex-col justify-between ${
                  srv.highlight
                    ? 'bg-emerald-900 text-white border-emerald-800 shadow-md'
                    : 'bg-white text-slate-800 border-slate-200/90 shadow-xs'
                }`}
              >
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${srv.highlight ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {srv.name}
                  </span>
                  <a
                    href={`tel:${srv.number.replace(/-/g, '')}`}
                    className={`text-2xl font-black mt-1 block hover:underline ${srv.highlight ? 'text-white' : 'text-emerald-800'}`}
                  >
                    {srv.number}
                  </a>
                  <p className={`text-xs mt-2 leading-relaxed ${srv.highlight ? 'text-emerald-100' : 'text-slate-600'}`}>
                    {srv.purpose}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/40">
                  <a
                    href={`tel:${srv.number.replace(/-/g, '')}`}
                    className={`min-h-[40px] w-full flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition ${
                      srv.highlight
                        ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-700 hover:text-white'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Dial Now</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Hazard Protocol 1: Monsoon Flash Floods & GLOF Events */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Waves className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Flash Floods &amp; Glacial Lake Outbursts (GLOF)
              </h2>
              <p className="text-xs text-slate-500">Riparian safety in Northern river basins and monsoon precautions</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              During intense summer heatwaves and heavy monsoon spells (July through September), glacial melt rates surge.
              Over 3,000 glacial lakes exist in northern Pakistan, with approximately 33 classified as potentially prone to
              abrupt glacial outbursts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  <span>Never Camp on Riverbeds</span>
                </h3>
                <p className="text-slate-600">
                  Mountain stream volumes can rise by 3 to 5 meters in under 15 minutes due to cloudbursts or dam bursts upstream.
                  Maintain campsite elevation at least 30 meters above the active flood line.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-emerald-600" />
                  <span>Observe Natural Warning Cues</span>
                </h3>
                <p className="text-slate-600">
                  A sudden discoloration of mountain stream water (turning from clear or glacial cyan to muddy brown) or a deep
                  rumbling sound indicates an approaching debris flow. Immediately move to higher ground.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Hazard Protocol 2: Winter Snowstorms & Avalanches */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <MountainSnow className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Snow Hazards, Ice &amp; Avalanche Zones
              </h2>
              <p className="text-xs text-slate-500">Malam Jabba, Naran, Skardu, and Khunjerab winter precautions</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <ul className="list-disc list-inside space-y-2 text-slate-700 pl-2">
              <li><strong>Tire Chains:</strong> Vehicular travel past Murree, Kalam, or Shigar in winter requires anti-skid tire snow chains.</li>
              <li><strong>Carbon Monoxide Precautions:</strong> If stranded in a snowdrift with the vehicle engine idling for heat, ensure the tailpipe is kept clear of snow pack to prevent fatal CO gas build-up inside the cabin.</li>
              <li><strong>Layered Thermal Clothing:</strong> Hypothermia can occur in temperatures as high as 10°C if clothing becomes wet. Pack moisture-wicking synthetic or wool base layers and a windproof waterproof outer shell.</li>
            </ul>
          </div>
        </section>

        {/* Section: Official Weather Monitoring Resources */}
        <section className="p-6 sm:p-8 rounded-3xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <Radio className="w-6 h-6 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-lg">Official Meteorological Portals</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Always inspect 48-hour satellite radar and precipitation forecasts before departing transit hubs.
            Refer to the Pakistan Meteorological Department (PMD) daily weather bulletin (<strong>pmd.gov.pk</strong>) and
            National Disaster Management Authority alerts (<strong>ndma.gov.pk</strong>).
          </p>
        </section>
      </main>
    </div>
  );
}
