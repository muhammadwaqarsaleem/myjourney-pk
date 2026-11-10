/**
 * @fileoverview AI Travel Assistant and Itinerary Planner Service.
 * Integrates Google Gemini API via @google/genai to produce structured multi-day
 * travel itineraries for destinations across Pakistan, with automatic fallback
 * to a high-fidelity local mock generator when offline or unconfigured.
 * @module services/aiPlannerService
 */

import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import Destination from '../models/Destination.js';

/**
 * Curated offline fallback destinations for zero-dependency local testing
 * when MongoDB Atlas is unreachable or operating in offline testing mode.
 */
const FALLBACK_DESTINATIONS = {
  default: {
    _id: '65f000000000000000000001',
    name: 'Hunza Valley',
    province: 'Gilgit-Baltistan',
    description: 'An alpine sanctuary in the Karakoram range celebrated for azure lakes and ancient forts.',
    bestTimeToVisit: 'April to October',
    climateInfo: 'Crisp mountain climate with cool pleasant summers.',
    sitesToVisit: [
      {
        name: 'Baltit Fort',
        category: 'Historical',
        description: 'Over 800-year-old Tibetan-influenced royal residence overlooking Karimabad.',
        ticketInfo: 'PKR 400 (Domestic), PKR 1,200 (International)',
      },
      {
        name: 'Attabad Lake',
        category: 'Natural',
        description: 'Vibrant turquoise mountain lake formed in 2010, ideal for boating.',
        ticketInfo: 'Boating rides PKR 1,000 - 2,500',
      },
      {
        name: 'Passu Cones & Suspension Bridge',
        category: 'Adventure',
        description: 'Dramatic serrated peaks towering over the Hunza River and suspension bridge.',
        ticketInfo: 'PKR 100 bridge preservation fee',
      },
      {
        name: "Eagle's Nest (Duikar)",
        category: 'Natural',
        description: 'Panoramic viewpoint offering 360-degree sunrise and sunset vistas.',
        ticketInfo: 'Free access',
      },
    ],
    famousFoods: [
      {
        name: 'Chapshuro',
        mustTrySpot: 'Karimabad Bazaar',
        description: 'Minced beef or yak pie packed with mountain herbs and onions.',
      },
      {
        name: 'Organic Hunza Apricot Cake',
        mustTrySpot: 'Café de Hunza, Karimabad',
        description: 'Dense slice made with local sundried apricots, walnuts, and mountain honey.',
      },
      {
        name: 'Gyaling with Apricot Oil',
        mustTrySpot: 'Al-Barakat Local Cuisine',
        description: 'Traditional flatbread crepes served hot drenched in cold-pressed apricot oil.',
      },
    ],
  },
};

/**
 * Singleton cache for GoogleGenAI instance.
 * @type {GoogleGenAI|null}
 */
let cachedGenAI = null;

/**
 * Retrieves or instantiates the GoogleGenAI client if GEMINI_API_KEY is configured.
 *
 * @returns {GoogleGenAI|null}
 */
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  if (!cachedGenAI) {
    cachedGenAI = new GoogleGenAI({ apiKey });
  }
  return cachedGenAI;
};

/**
 * Strips Markdown code blocks and extracts raw JSON text.
 *
 * @param {string} text - Raw string output from LLM.
 * @returns {string} Sanitized JSON string.
 */
export const stripMarkdownJson = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  let cleaned = text.trim();

  // Remove leading ```json or ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '');
  }

  // Remove trailing ```
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.replace(/\s*```$/, '');
  }

  return cleaned.trim();
};

/**
 * Parses and strictly validates the itinerary JSON structure returned by the LLM or mock.
 *
 * @param {string} jsonString - JSON payload string.
 * @param {Object} destination - Destination model document.
 * @param {number} days - Number of days in the trip.
 * @returns {Object} Validated and structured itinerary object.
 */
export const parseAndValidateItinerary = (jsonString, destination, days) => {
  const cleaned = stripMarkdownJson(jsonString);
  let parsed;

  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse AI output as JSON: ${err.message}. Raw output snippet: ${cleaned.slice(0, 100)}...`);
  }

  // Normalize and validate tripTitle
  const tripTitle =
    typeof parsed.tripTitle === 'string' && parsed.tripTitle.trim()
      ? parsed.tripTitle.trim()
      : `${days}-Day Tour of ${destination.name}`;

  // Normalize destination name
  const destinationName =
    typeof parsed.destination === 'string' && parsed.destination.trim()
      ? parsed.destination.trim()
      : destination.name;

  // Normalize estimatedBudgetPKR
  const estimatedBudgetPKR =
    typeof parsed.estimatedBudgetPKR === 'number' && !isNaN(parsed.estimatedBudgetPKR)
      ? Math.max(0, Math.round(parsed.estimatedBudgetPKR))
      : 25000 * days;

  // Normalize dailyPlan
  let dailyPlan = Array.isArray(parsed.dailyPlan) ? parsed.dailyPlan : [];

  // Guarantee at least 1 day and clamp/fill up to requested days
  if (dailyPlan.length === 0) {
    dailyPlan = [
      {
        day: 1,
        title: `Arrival & Discovery of ${destination.name}`,
        morning: `Arrive in ${destination.name} and check in to accommodation.`,
        afternoon: `Visit local viewpoints and explore nearby bazaars.`,
        evening: `Dine at local culinary spots and sample regional specialties.`,
        recommendedFood: destination.famousFoods?.map((f) => f.name).slice(0, 2) || ['Local specialties'],
      },
    ];
  }

  // Sanitize each day
  dailyPlan = dailyPlan.slice(0, days).map((item, index) => {
    const dayNumber = Number(item.day) || index + 1;
    const title =
      typeof item.title === 'string' && item.title.trim()
        ? item.title.trim()
        : `Day ${dayNumber}: Highlights of ${destination.name}`;
    const morning = typeof item.morning === 'string' ? item.morning.trim() : '';
    const afternoon = typeof item.afternoon === 'string' ? item.afternoon.trim() : '';
    const evening = typeof item.evening === 'string' ? item.evening.trim() : '';
    const recommendedFood = Array.isArray(item.recommendedFood)
      ? item.recommendedFood.filter((f) => typeof f === 'string' && f.trim()).map((f) => f.trim())
      : [];

    return {
      day: dayNumber,
      title,
      morning,
      afternoon,
      evening,
      recommendedFood,
    };
  });

  // Normalize travelTips
  const travelTips = Array.isArray(parsed.travelTips)
    ? parsed.travelTips.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
    : [
        'Carry physical cash (PKR) as ATMs and card machines can have intermittent connectivity in mountainous areas.',
        'Dress modestly and respect local customs and sacred heritage landmarks.',
        'Keep identification documents and travel bookings easily accessible.',
      ];

  return {
    tripTitle,
    destination: destinationName,
    estimatedBudgetPKR,
    dailyPlan,
    travelTips,
  };
};

/**
 * Generates a realistic mock itinerary when Gemini API key is missing or offline.
 *
 * @param {Object} destination - Destination document from MongoDB.
 * @param {Object} options - Trip preferences.
 * @param {number} options.days - Number of days.
 * @param {string} options.budget - 'budget' | 'moderate' | 'luxury'.
 * @param {string[]} options.interests - List of interest tags.
 * @param {number} options.travelersCount - Number of travelers.
 * @returns {Object} Structured travel plan matching the required schema.
 */
export const generateMockItinerary = (destination, { days, budget, interests, travelersCount }) => {
  const budgetRatesPerPersonPerDay = {
    budget: 5500,
    moderate: 14000,
    luxury: 32000,
  };

  const rate = budgetRatesPerPersonPerDay[budget] || budgetRatesPerPersonPerDay.moderate;
  const estimatedBudgetPKR = Math.round(rate * days * travelersCount);

  const sites = destination.sitesToVisit || [];
  const foods = destination.famousFoods || [];

  const dailyPlan = [];

  for (let d = 1; d <= days; d += 1) {
    const site1 = sites[(d - 1) * 2 % Math.max(1, sites.length)];
    const site2 = sites[((d - 1) * 2 + 1) % Math.max(1, sites.length)];
    const food1 = foods[(d - 1) % Math.max(1, foods.length)];
    const food2 = foods[d % Math.max(1, foods.length)];

    let dayTitle = `Day ${d}: `;
    if (d === 1) {
      dayTitle += `Arrival & Heritage Discovery in ${destination.name}`;
    } else if (d === days) {
      dayTitle += `Scenic Panoramas, Souvenirs & Departure`;
    } else {
      dayTitle += `Exploring ${site1?.name || destination.name} & Cultural Wonders`;
    }

    const morningActivity = site1
      ? `Begin the morning exploring ${site1.name}. ${site1.description || 'Take in the scenery and historic architecture.'} (${site1.ticketInfo || 'Entry available on site'}).`
      : `Morning sightseeing tour across central ${destination.name} with early sunrise vistas.`;

    const afternoonActivity = site2
      ? `After lunch, head towards ${site2.name}. ${site2.description || 'Enjoy guided exploration and photography.'}`
      : `Afternoon immersion in local heritage quarters and artisan craft markets.`;

    const eveningActivity = food1
      ? `Stroll through the vibrant evening food streets. Savor authentic ${food1.name}${food1.mustTrySpot ? ` at ${food1.mustTrySpot}` : ''}, followed by traditional tea.`
      : `Relax at a local scenic tea spot, enjoying sunset views over ${destination.name}.`;

    const recommendedDishes = [];
    if (food1?.name) recommendedDishes.push(food1.name);
    if (food2?.name && food2.name !== food1?.name) recommendedDishes.push(food2.name);
    if (recommendedDishes.length === 0) {
      recommendedDishes.push('Authentic Regional Delicacies', 'Traditional Karak Chai');
    }

    dailyPlan.push({
      day: d,
      title: dayTitle,
      morning: morningActivity,
      afternoon: afternoonActivity,
      evening: eveningActivity,
      recommendedFood: recommendedDishes,
    });
  }

  const travelTips = [
    `Carry adequate cash (PKR) and EasyPaisa/JazzCash as local stalls and transport operators may not accept credit cards.`,
    `Respect regional customs by dressing modestly, particularly when visiting historic shrines, mosques, or traditional villages in ${destination.province}.`,
    `Plan road travel during daylight hours, especially on mountainous or winding highways across ${destination.province}.`,
    `Keep your original CNIC (for Pakistani citizens) or passport (for international tourists) handy for highway checkpoints.`,
    `Check weather updates before departure; pack layered clothing suitable for ${destination.bestTimeToVisit || 'the current season'}.`,
  ];

  return {
    tripTitle: `${days}-Day ${budget.charAt(0).toUpperCase() + budget.slice(1)} Escape to ${destination.name}`,
    destination: destination.name,
    estimatedBudgetPKR,
    dailyPlan,
    travelTips,
  };
};

/**
 * Builds the LLM prompt for Gemini travel planner.
 *
 * @param {Object} destination - Destination model data.
 * @param {Object} options - Trip parameters.
 * @returns {string} Fully formulated prompt text.
 */
const buildPrompt = (destination, { days, budget, interests, travelersCount }) => {
  const sitesList =
    destination.sitesToVisit?.length > 0
      ? destination.sitesToVisit
          .map((s) => `- ${s.name} (${s.category || 'Sight'}): ${s.description || 'Iconic attraction'} | Ticket: ${s.ticketInfo || 'N/A'}`)
          .join('\n')
      : '- Iconic regional sights and natural landmarks';

  const foodsList =
    destination.famousFoods?.length > 0
      ? destination.famousFoods
          .map((f) => `- ${f.name}${f.mustTrySpot ? ` (Famous at: ${f.mustTrySpot})` : ''}: ${f.description || 'Local culinary specialty'}`)
          .join('\n')
      : '- Authentic regional Pakistani cuisine and street food';

  return `You are a certified professional travel planner and native tour guide for Pakistan tourism (myjourney.pk).
Your task is to generate a comprehensive, highly realistic ${days}-day travel itinerary for visiting ${destination.name}, located in ${destination.province}, Pakistan.

TRIP REQUIREMENTS:
- Destination: ${destination.name}, ${destination.province}
- Duration: ${days} day(s)
- Budget Tier: ${budget} (budget: economical/hostels/local coasters, moderate: quality 3-star/cabs, luxury: premium hotels/private 4x4)
- Number of Travelers: ${travelersCount}
- Traveler Interests: ${interests.join(', ')}

CURATED DESTINATION DATA FROM DATABASE:
Attractions & Sights:
${sitesList}

Famous Local Foods & Specialties:
${foodsList}

Best Time to Visit: ${destination.bestTimeToVisit || 'Year-round'}
Climate Info: ${destination.climateInfo || 'Temperate'}

CRITICAL OUTPUT CONSTRAINTS:
1. Return ONLY a single raw JSON object matching the exact schema below.
2. DO NOT include markdown backticks like \`\`\`json or \`\`\`.
3. DO NOT include commentary, notes, or explanations before or after the JSON.
4. Ensure estimatedBudgetPKR is a realistic integer number in Pakistani Rupees for ${travelersCount} traveler(s) over ${days} day(s) under the ${budget} tier.
5. Provide detailed, engaging morning, afternoon, and evening descriptions for all ${days} days.
6. Incorporate the listed attractions and famous foods seamlessly into the daily schedule.
7. Include 3 to 6 practical, culturally sensitive travel tips tailored for visiting ${destination.name}, ${destination.province}.

EXACT JSON SCHEMA:
{
  "tripTitle": "Short catchy title for the travel plan",
  "destination": "${destination.name}",
  "estimatedBudgetPKR": 45000,
  "dailyPlan": [
    {
      "day": 1,
      "title": "Day 1 Title",
      "morning": "Morning activity description",
      "afternoon": "Afternoon activity description",
      "evening": "Evening activity description",
      "recommendedFood": ["Dish 1", "Dish 2"]
    }
  ],
  "travelTips": [
    "Practical local travel tip 1",
    "Practical local travel tip 2"
  ]
}`;
};

/**
 * Main AI Itinerary Planner generation service.
 * Fetches destination details, prompts Gemini (or falls back to mock generator),
 * and returns validated structured itinerary data.
 *
 * @async
 * @param {Object} params
 * @param {string} params.destinationId - MongoDB ObjectId of destination.
 * @param {number} [params.days=3] - Number of days (1-14).
 * @param {string} [params.budget='moderate'] - 'budget' | 'moderate' | 'luxury'.
 * @param {string[]|string} [params.interests] - Array or string of interests.
 * @param {number} [params.travelersCount=1] - Number of travelers.
 * @returns {Promise<Object>} Structured itinerary response.
 */
export const generateItineraryPlan = async ({
  destinationId,
  days = 3,
  budget = 'moderate',
  interests = ['Sightseeing', 'Food & Culinary', 'Culture'],
  travelersCount = 1,
}) => {
  // 1. Fetch Destination from MongoDB
  let destination;
  if (mongoose.connection.readyState === 1) {
    try {
      destination = await Destination.findById(destinationId).lean();
    } catch (dbError) {
      console.warn(`⚠️ [aiPlannerService] Destination DB query error: ${dbError.message}`);
    }
  }

  // Support seamless offline testing when database connection is not active
  if (!destination && mongoose.connection.readyState !== 1) {
    console.warn(`⚠️ [aiPlannerService] MongoDB disconnected (readyState: ${mongoose.connection.readyState}). Using offline fallback destination for testing.`);
    destination = FALLBACK_DESTINATIONS[String(destinationId)] || FALLBACK_DESTINATIONS.default;
  }

  if (!destination) {
    const error = new Error(`Destination with ID '${destinationId}' was not found.`);
    error.statusCode = 404;
    throw error;
  }

  // 2. Sanitize and normalize input parameters
  const tripDays = Math.max(1, Math.min(14, parseInt(days, 10) || 3));
  const normalizedBudget = ['budget', 'moderate', 'luxury'].includes(String(budget).toLowerCase())
    ? String(budget).toLowerCase()
    : 'moderate';
  const numTravelers = Math.max(1, parseInt(travelersCount, 10) || 1);

  let sanitizedInterests = [];
  if (Array.isArray(interests)) {
    sanitizedInterests = interests.filter((i) => typeof i === 'string' && i.trim()).map((i) => i.trim());
  } else if (typeof interests === 'string' && interests.trim()) {
    sanitizedInterests = interests.split(',').map((i) => i.trim()).filter(Boolean);
  }
  if (sanitizedInterests.length === 0) {
    sanitizedInterests = ['Sightseeing', 'Culture', 'Local Cuisine'];
  }

  const tripOptions = {
    days: tripDays,
    budget: normalizedBudget,
    interests: sanitizedInterests,
    travelersCount: numTravelers,
  };

  // 3. Check for Gemini API key
  const genAI = getGeminiClient();

  if (!genAI) {
    console.log('ℹ️ [aiPlannerService] GEMINI_API_KEY is not defined. Using mock itinerary generator.');
    return generateMockItinerary(destination, tripOptions);
  }

  // 4. Invoke Google Gemini API
  const prompt = buildPrompt(destination, tripOptions);
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from Gemini model.');
    }

    return parseAndValidateItinerary(responseText, destination, tripDays);
  } catch (apiError) {
    console.warn(`⚠️ [aiPlannerService] Gemini API generation failed (${apiError.message}). Falling back to mock generator.`);
    return generateMockItinerary(destination, tripOptions);
  }
};

export default {
  generateItineraryPlan,
  generateMockItinerary,
  stripMarkdownJson,
  parseAndValidateItinerary,
};
