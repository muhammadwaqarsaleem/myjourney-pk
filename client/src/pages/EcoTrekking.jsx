/**
 * @fileoverview Eco-friendly Trekking Practices Page for myjourney.pk.
 * Covers Leave No Trace (LNT) principles, plastic-free expeditions, high-altitude
 * waste management, campfire restrictions, and endangered wildlife stewardship.
 * 
 * ============================================================================
 * ACADEMIC DEFENSE & ARCHITECTURAL HIGHLIGHTS
 * ============================================================================
 * 1. Environmental Stewardship in Fragile Alpine Ecosystems:
 *    - The Karakoram and Western Himalayan alpine zones operate under extreme
 *      biodiversity vulnerability and very low natural biodegradation rates.
 *    - Details the 7 Leave No Trace (LNT) principles tailored to Pakistani mountain terrain.
 * 
 * 2. Wildlife Conservation & Endangered Species:
 *    - Highlights non-interference guidelines for iconic fauna: Snow Leopard (Panthera uncia),
 *      Himalayan Brown Bear (Deosai National Park), and Flare-horned Markhor (Capra falconeri).
 * 
 * @module pages/EcoTrekking
 */

import { Link } from 'react-router-dom';
import {
  Trees,
  Trash2,
  Flame,
  Footprints,
  Droplets,
  Bird,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const LNT_PRINCIPLES = [
  {
    num: '1',
    title: 'Plan Ahead & Prepare',
    desc: 'Repackage dry rations in reusable containers before embarking to eliminate single-use wrappers at basecamp.',
  },
  {
    num: '2',
    title: 'Travel & Camp on Durable Surfaces',
    desc: 'Pitch tents on established campsites or gravel beds. Avoid crushing delicate alpine tundra or wildflower meadows.',
  },
  {
    num: '3',
    title: 'Dispose of Waste Properly (Pack It In, Pack It Out)',
    desc: 'Every piece of non-biodegradable waste (plastics, foil, batteries) carried into the valley MUST be packed out.',
  },
  {
    num: '4',
    title: 'Leave What You Find',
    desc: 'Leave rocks, wildflowers, quartz crystals, fossils, and historical artifacts undisturbed for fellow explorers.',
  },
  {
    num: '5',
    title: 'Minimize Campfire Impacts',
    desc: 'High-altitude juniper trees take centuries to grow. Never cut live branches; use portable gas or kerosene stoves.',
  },
  {
    num: '6',
    title: 'Respect Wildlife & Livestock',
    desc: 'Observe animals from a distance. Never feed bears or marmots, as human food habituation leads to animal mortality.',
  },
  {
    num: '7',
    title: 'Be Considerate of Other Visitors',
    desc: 'Respect the tranquility of the mountain wilderness. Yield to uphill trekkers and pack animal convoys on narrow trails.',
  },
];

export default function EcoTrekking() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-700/10 via-emerald-50/30 to-transparent border-b border-slate-200/60 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wide uppercase mb-3">
            <Trees className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sustainable Tourism &amp; Conservation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">
            Eco-Friendly Trekking Practices
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Conserving the pristine glaciers, glacial rivers, and biodiversity of the Karakoram,
            Hindukush, and Himalayan mountain ranges through Leave No Trace ethics.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        {/* The 7 Leave No Trace Principles */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                The 7 Principles of Leave No Trace
              </h2>
              <p className="text-xs text-slate-500">Universal wilderness conservation guidelines adapted for Pakistan expeditions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {LNT_PRINCIPLES.map((principle) => (
              <div
                key={principle.num}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {principle.num}
                </div>
                <div className="text-xs sm:text-sm">
                  <h3 className="font-bold text-slate-900">{principle.title}</h3>
                  <p className="text-slate-600 mt-1 leading-relaxed">{principle.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Plastic Free Mountain Initiative */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Plastic-Free Mountains &amp; Water Purification
              </h2>
              <p className="text-xs text-slate-500">Eliminating disposable water bottles on trekking trails</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Thousands of empty single-use plastic water bottles are discarded annually along popular trails such as
              Fairy Meadows, Rakaposhi Basecamp, and Naltar Lakes. In freezing alpine temperatures, plastic takes over
              500 years to degrade, contaminating downstream drinking water sources.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <Droplets className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-emerald-950">
                <p className="font-bold">Carry Reusable Canteens &amp; Water Filters</p>
                <p className="mt-0.5">
                  Carry a durable insulated stainless-steel bottle or hydration bladder. Use gravity water filters,
                  UV purifiers (SteriPEN), or chlorine dioxide purification tablets to purify natural glacial springs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Endangered Wildlife Stewardship */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Bird className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Endangered Wildlife &amp; Protected National Parks
              </h2>
              <p className="text-xs text-slate-500">Deosai, Khunjerab, Chitral Gol, and Hingol National Parks</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              Pakistan provides refuge to extraordinary species, including the elusive <strong>Snow Leopard</strong>,
              the <strong>Himalayan Brown Bear</strong> in Deosai, and the national animal, the <strong>Markhor</strong>.
            </p>

            <ul className="list-disc list-inside space-y-2 text-slate-700 pl-2">
              <li><strong>Stay on Designated Tracks:</strong> Off-road vehicular driving over Deosai Plains destroys ground-nesting bird habitats and fragile alpine root systems.</li>
              <li><strong>Secure Food Containers:</strong> In bear habitats, hang food packs away from tents or store them in bear-resistant canisters to prevent dangerous nocturnal encounters.</li>
              <li><strong>Respect Wildlife Sanctuaries:</strong> Never play loud portable speakers or launch unauthorized drones in designated wildlife sanctuaries.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
