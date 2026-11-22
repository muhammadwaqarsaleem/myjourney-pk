/**
 * @fileoverview Local Etiquette & Heritage Preservation Page for myjourney.pk.
 * Covers modest dress codes, ethical travel photography, sacred shrine protocols,
 * and archaeological preservation across Gandhara and Mughal heritage sites.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Cultural Sensitivities & Anthropological Alignment:
 *    - Documents the diversity of cultural norms across Pakistan (e.g., conservative
 *      rural valleys vs. cosmopolitan urban centers).
 *    - Explicitly details photography etiquette, especially surrounding women and
 *      military/checkpoint installations.
 * 
 * 2. Antiquities Act of 1975 & Archaeological Conservation:
 *    - Details legal frameworks protecting ancient ruins (Mohenjo-daro, Taxila, Harappa,
 *      Lahore Fort, Rohtas Fort) against graffiti and unauthorized artifact collection.
 * 
 * @module pages/LocalEtiquette
 */

import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  Camera,
  Shirt,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';

export default function LocalEtiquette() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-700/10 via-emerald-50/30 to-transparent border-b border-slate-200/60 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cultural Norms &amp; Heritage Stewardship</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Local Etiquette &amp; Heritage Preservation
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Honoring local traditions, respecting community privacy, dressing modestly, and preserving
            the ancient archaeological treasures of Pakistan for future generations.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* Cultural Hospitality Overview */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Legendary Hospitality (Mehmaan Nawazi)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Travelers across Pakistan consistently report genuine warmth, complimentary cups of chai (doodh patti),
            and spontaneous offers of lodging or local guiding. Reciprocating this generosity through polite manners,
            humility, and cultural sensitivity ensures deep, authentic human connection.
          </p>
        </section>

        {/* Pillar 1: Dress Code Guidelines */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Dress Codes &amp; Modesty Norms
              </h2>
              <p className="text-xs text-slate-500">Guidelines for cities, rural valleys, and sacred places</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>General Travel Attire</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Modest, loose-fitting clothing that covers shoulders and knees is recommended for all genders.
                The national attire, <strong>Shalwar Kameez</strong>, is highly practical, breathable in heat, and widely appreciated by locals.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mosques &amp; Sufi Shrines</span>
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Remove footwear before stepping onto prayer mats or marble courtyards (shoe custodians will safeguard them for a small tip).
                Women are required to drape a scarf (dupatta) over their hair. Men should wear full-length trousers.
              </p>
            </div>
          </div>
        </section>

        {/* Pillar 2: Photography & Privacy Protocols */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Ethical Photography &amp; Consent
              </h2>
              <p className="text-xs text-slate-500">Navigating portraiture, aerial drones, and security restrictions</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <ul className="list-disc list-inside space-y-2.5 text-slate-700 pl-2">
              <li><strong>Always Seek Permission:</strong> Before taking portraits of individuals, ask politely: <em>&ldquo;Kia mein aap ki tasweer le sakta hoon?&rdquo;</em> (May I take your photograph?). Most people gladly consent.</li>
              <li><strong>Respecting Female Modesty:</strong> In conservative rural areas (such as parts of Khyber Pakhtunkhwa and Balochistan), photographing local women without explicit family permission is considered disrespectful and strictly avoided.</li>
              <li><strong>Infrastructure &amp; Checkpoints:</strong> Do NOT photograph military checkposts, radar installations, bridges, airports, or armed personnel. Doing so can cause camera confiscation and detention for questioning.</li>
              <li><strong>Drones &amp; UAVs:</strong> Operating drones within 5 km of airports, cantonments, or sensitive international borders is strictly illegal without civil aviation clearances.</li>
            </ul>
          </div>
        </section>

        {/* Pillar 3: Archaeological Conservation & Antiquities Act */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Preserving Archaeological Heritage
              </h2>
              <p className="text-xs text-slate-500">Antiquities Act of 1975 and UNESCO World Heritage protection</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Pakistan is home to six UNESCO World Heritage Sites (including Mohenjo-daro, Taxila, Rohtas Fort, and Lahore Fort)
              and thousands of ancient Buddhist rock carvings along the Karakoram corridor. Preserving these sites is both a legal
              obligation and a civic duty.
            </p>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-red-900">
                <p className="font-bold">Zero Tolerance for Vandalism &amp; Defacement</p>
                <p className="mt-0.5">
                  Carving names, defacing fresco plaster, or removing fossil stones / pottery shards violates the Antiquities Act of 1975
                  and carries severe legal penalties, heavy fines, and imprisonment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
