/**
 * @fileoverview Conversational AI Travel Guide Service for myjourney.pk.
 * Integrates Google Gemini API via @google/genai to provide intelligent,
 * culturally grounded travel assistance with internal platform deep links,
 * featuring automatic fallback to a high-fidelity mock generator when offline
 * or unconfigured.
 * @module services/aiChatService
 */

import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import Destination from '../models/Destination.js';
import Hotel from '../models/Hotel.js';

/**
 * Curated offline fallback destinations for grounding when MongoDB is offline
 * or when operating in zero-dependency sandbox testing environments.
 */
const FALLBACK_DESTINATIONS = [
  { name: 'Hunza Valley', slug: 'hunza-valley', province: 'Gilgit-Baltistan' },
  { name: 'Skardu', slug: 'skardu', province: 'Gilgit-Baltistan' },
  { name: 'Lahore', slug: 'lahore', province: 'Punjab' },
  { name: 'Swat Valley', slug: 'swat-valley', province: 'Khyber Pakhtunkhwa' },
  { name: 'Islamabad', slug: 'islamabad', province: 'Islamabad Capital Territory' },
  { name: 'Fairy Meadows', slug: 'fairy-meadows', province: 'Gilgit-Baltistan' },
];

/**
 * Curated offline fallback hotels for grounding when MongoDB is offline.
 */
const FALLBACK_HOTELS = [
  { name: 'Hunza Serena Inn', slug: 'hunza-serena-inn' },
  { name: 'Pearl Continental Hotel Lahore', slug: 'pearl-continental-lahore' },
  { name: 'Shangrila Resort Skardu', slug: 'shangrila-resort-skardu' },
  { name: 'Serena Hotel Islamabad', slug: 'serena-hotel-islamabad' },
];

/**
 * Singleton cache for GoogleGenAI instance.
 * @type {GoogleGenAI|null}
 */
let cachedGenAI = null;

/**
 * In-memory cache for platform context to avoid repetitive DB queries.
 */
let cachedPlatformContext = null;
let contextCacheExpiry = 0;
const CONTEXT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Retrieves or instantiates the GoogleGenAI client if GEMINI_API_KEY is configured.
 *
 * @returns {GoogleGenAI|null} Initialized GoogleGenAI client or null if key absent.
 */
export const getGeminiClient = () => {
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
 * Fetches lightweight platform catalog context (destination and hotel names/slugs)
 * from MongoDB, falling back to curated defaults if database is unreachable.
 *
 * @async
 * @returns {Promise<{ destinations: Array<{ name: string, slug: string, province?: string }>, hotels: Array<{ name: string, slug: string }> }>}
 */
export const getPlatformContext = async () => {
  const now = Date.now();
  if (cachedPlatformContext && now < contextCacheExpiry) {
    return cachedPlatformContext;
  }

  let destinations = [];
  let hotels = [];

  if (mongoose.connection.readyState === 1) {
    try {
      const [dbDestinations, dbHotels] = await Promise.all([
        Destination.find({}, 'name slug province').lean().limit(100),
        Hotel.find({}, 'name slug').lean().limit(100),
      ]);

      if (Array.isArray(dbDestinations) && dbDestinations.length > 0) {
        destinations = dbDestinations;
      }
      if (Array.isArray(dbHotels) && dbHotels.length > 0) {
        hotels = dbHotels;
      }
    } catch (dbError) {
      console.warn(`⚠️ [aiChatService] Failed to load entities from MongoDB: ${dbError.message}. Using fallback catalog.`);
    }
  }

  if (destinations.length === 0) {
    destinations = FALLBACK_DESTINATIONS;
  }
  if (hotels.length === 0) {
    hotels = FALLBACK_HOTELS;
  }

  cachedPlatformContext = { destinations, hotels };
  contextCacheExpiry = now + CONTEXT_CACHE_TTL_MS;

  return cachedPlatformContext;
};

/**
 * Builds the comprehensive system instruction prompt that establishes the
 * official travel guide persona and grounds responses in real platform entities.
 *
 * @param {Object} context - Platform context containing destinations and hotels.
 * @param {Array} context.destinations - List of destination objects.
 * @param {Array} context.hotels - List of hotel objects.
 * @returns {string} Formatted system instruction string.
 */
export const buildSystemPrompt = ({ destinations, hotels }) => {
  const destListStr = destinations
    .map((d) => `- ${d.name}${d.province ? ` (${d.province})` : ''}: /destinations/${d.slug}`)
    .join('\n');

  const hotelListStr = hotels
    .map((h) => `- ${h.name}: /hotels/${h.slug}`)
    .join('\n');

  return `You are the official AI Travel Guide and Hospitality Concierge for myjourney.pk, an expert on tourism, culture, logistics, and hotels in Pakistan.

INTERNAL PLATFORM CATALOG (GROUNDING DATA):
Destinations:
${destListStr}

Partner Hotels:
${hotelListStr}

Internal Platform Tools:
- Community Travel Stories: [Travel Blogs](/blogs)
- Custom Tour Itinerary Generator: [Itinerary Planner](/planner)

RESPONSE STYLE & CONVERSION DIRECTIVES:
1. BE PRECISE & DIRECT: Answer the user's specific travel question promptly, concisely, and accurately. Avoid generic fluff or drawn-out preamble.
2. CONVERSION & HOTEL PARTNERSHIPS (HIGH PRIORITY):
   - We actively partner with and promote accommodations on myjourney.pk.
   - If adding any extra suggestions or recommendations, ALWAYS prioritize hotel conversions: proactively suggest a partner hotel in that region using its markdown link [Hotel Name](/hotels/:slug).
   - Highlight 1-2 distinct perks (scenic mountain views, luxury hospitality, central heritage location, backup power) and encourage the user to check out their rooms and amenities on our portal.
   - If the user asks about an area where we have a listed partner hotel (e.g., Hunza -> [Hunza Serena Inn](/hotels/hunza-serena-inn), Lahore -> [Pearl Continental Hotel Lahore](/hotels/pearl-continental-lahore), Skardu -> [Shangrila Resort Skardu](/hotels/shangrila-resort-skardu), Islamabad -> [Serena Hotel Islamabad](/hotels/serena-hotel-islamabad)), prioritize featuring that property.
3. INTERNAL ROUTE DEEP LINKING:
   - Format destinations as [Destination Name](/destinations/:slug).
   - Format hotels as [Hotel Name](/hotels/:slug).
   - Only link to destinations and hotels that exist in the lists above using their exact slugs.
4. PRACTICAL LOGISTICS:
   - Mention practical details when relevant (carrying cash PKR/EasyPaisa in remote valleys, seasonal passes like Babusar Top, modest attire at shrines).
5. FORMATTING:
   - Keep answers cleanly formatted with markdown bold text, short bullet points, and high-impact calls to action.`;
};

/**
 * Generates an automated, realistic, high-fidelity mock reply grounded in Pakistan
 * tourism when the Gemini API is unreachable, offline, or unconfigured.
 * Tailored for high precision and hotel conversion.
 *
 * @param {string} message - User message text.
 * @returns {string} Realistic markdown response with platform links and hotel conversions.
 */
export const generateMockChatReply = (message = '') => {
  const query = message.toLowerCase();

  // 1. Safety and security inquiries
  if (query.includes('safe') || query.includes('security') || query.includes('women') || query.includes('solo')) {
    return `### 🛡️ Safety & Travel in Pakistan

Mainstream tourist destinations in Pakistan—including [Hunza Valley](/destinations/hunza-valley), [Skardu](/destinations/skardu), Islamabad, and [Lahore](/destinations/lahore)—are welcoming and safe for both solo travelers and families.

**Key Guidelines:**
- **Local Etiquette:** Modest attire (covering shoulders and knees) is recommended nationwide; a light scarf is customary when entering mosques and shrines.
- **Checkpoints & IDs:** Carry your original CNIC or foreign passport with visa copies for routine tourist checkposts along the Karakoram Highway.
- **Cash Logistics:** ATMs can experience downtime in remote mountain valleys; always carry physical Pakistani Rupees (PKR).

**🏨 Recommended Secure Stay:**
For unmatched security, comfort, and hospitality, we highly recommend staying at verified partner hotels such as [Hunza Serena Inn](/hotels/hunza-serena-inn) in the north or [Pearl Continental Hotel Lahore](/hotels/pearl-continental-lahore) in Punjab. Explore their amenities and reserve your stay on our platform!`;
  }

  // 2. Weather, seasons, best time to visit
  if (query.includes('weather') || query.includes('season') || query.includes('when to visit') || query.includes('best time') || query.includes('month') || query.includes('winter') || query.includes('summer')) {
    return `### ☀️ Best Seasons to Visit Pakistan

- **Northern Mountain Valleys ([Hunza Valley](/destinations/hunza-valley), [Skardu](/destinations/skardu), [Swat Valley](/destinations/swat-valley)):**
  - **May to October:** Prime travel window. High-altitude passes (like Babusar Top) are open, roads are clear, and weather is pleasantly mild (15°C – 28°C).
  - **October to November:** Spectacular golden autumn foliage across Gilgit-Baltistan.
- **Heritage & Cultural Cities ([Lahore](/destinations/lahore), Multan, Karachi):**
  - **October to March:** Cool, breezy winter months ideal for walking tours, bazaars, and food streets.

**🏨 Hotel Booking Tip:**
High-season rooms sell out quickly. Secure your mountain retreat early at [Hunza Serena Inn](/hotels/hunza-serena-inn) or lakeside at [Shangrila Resort Skardu](/hotels/shangrila-resort-skardu) before availability runs out!`;
  }

  // 3. Budget, money, currency, cash, cost
  if (query.includes('budget') || query.includes('cost') || query.includes('price') || query.includes('money') || query.includes('cash') || query.includes('rupee') || query.includes('pkr') || query.includes('atm')) {
    return `### 💰 Travel Budgets & Money in Pakistan

- **Budget / Backpacker:** ~PKR 4,500 – 7,500 / day (local guesthouses, coasters, street food).
- **Mid-Range Comfort:** ~PKR 12,000 – 22,000 / day (3-star hotels, private rides, family dining).
- **Luxury Tier:** PKR 35,000+ / day (premier heritage stays, private 4x4 SUVs, guided excursions).

**Crucial Cash Rule:** Always withdraw sufficient physical cash (PKR) in major cities (Islamabad, Gilgit) before visiting remote northern valleys where ATMs and card POS machines are intermittent.

**🏨 Premium Hospitality Value:**
Looking for world-class hospitality? Check out rates and exclusive room packages at [Pearl Continental Hotel Lahore](/hotels/pearl-continental-lahore) or [Hunza Serena Inn](/hotels/hunza-serena-inn). You can also generate an all-inclusive estimated budget on our [Itinerary Planner](/planner)!`;
  }

  // 4. Northern regions (Hunza, Skardu, Swat, Mountains, Gilgit)
  if (query.includes('hunza') || query.includes('skardu') || query.includes('swat') || query.includes('mountain') || query.includes('lake') || query.includes('trek') || query.includes('north')) {
    return `### 🏔️ Northern Pakistan Highlights

- **[Hunza Valley](/destinations/hunza-valley):** Famous for turquoise Attabad Lake, historical Baltit Fort, and serene apricot orchards.
- **[Skardu](/destinations/skardu):** Gateway to K2, the cold desert of Sarfaranga, and tranquil Shangrila Lake.
- **[Swat Valley](/destinations/swat-valley):** Pine-covered alpine ridges, Malam Jabba ski slopes, and ancient Buddhist heritage.

**🏨 Featured Hotel Partner:**
Make your northern trip unforgettable by booking a scenic room at [Hunza Serena Inn](/hotels/hunza-serena-inn) with direct views of Ultar Sar, or unwind at [Shangrila Resort Skardu](/hotels/shangrila-resort-skardu). Explore their rooms and book directly through myjourney.pk!`;
  }

  // 5. Cultural cities (Lahore, Islamabad, History, Food)
  if (query.includes('lahore') || query.includes('food') || query.includes('culture') || query.includes('history') || query.includes('shrine') || query.includes('mosque') || query.includes('islamabad')) {
    return `### 🕌 Culture, Heritage & Culinary Highlights

- **[Lahore](/destinations/lahore):** The cultural crown jewel. Must-see sites include Badshahi Mosque, Lahore Fort (Shahi Qila), and Shalimar Gardens. Sample authentic Phaddi Nihari at Waris Nihari in Anarkali and grilled Karahi at Gawalmandi Food Street.
- **Islamabad:** Peaceful capital city featuring the iconic Faisal Mosque, scenic Margalla Hills hiking trails, and picturesque views from Daman-e-Koh.

**🏨 Where to Stay in Lahore:**
For top-tier luxury and central city access along Mall Road, reserve your stay at [Pearl Continental Hotel Lahore](/hotels/pearl-continental-lahore). Check room options and premium dining facilities on our portal!`;
  }

  // 6. Hotels and accommodation inquiries
  if (query.includes('hotel') || query.includes('stay') || query.includes('resort') || query.includes('room') || query.includes('serena') || query.includes('pc') || query.includes('booking')) {
    return `### 🏨 Partner Hotels on myjourney.pk

Discover top-rated hospitality across Pakistan:

- **Northern Mountain Retreats:**
  - **[Hunza Serena Inn](/hotels/hunza-serena-inn):** Traditional Hunzakut architecture, private mountain balconies, and gourmet local dining.
  - **[Shangrila Resort Skardu](/hotels/shangrila-resort-skardu):** Renowned 'Heaven on Earth' resort situated beside Lower Kachura Lake.
- **City Luxury & Business:**
  - **[Pearl Continental Hotel Lahore](/hotels/pearl-continental-lahore):** 5-star comfort on Mall Road with executive dining, swimming pool, and health club.
  - **[Serena Hotel Islamabad](/hotels/serena-hotel-islamabad):** Iconic Islamic architecture and lush gardens in the capital.

Explore full property details, room types, and rates by clicking the hotel links above, or map out your entire route on the [Itinerary Planner](/planner)!`;
  }

  // 7. Itinerary planning or trip route requests
  if (query.includes('itinerary') || query.includes('plan') || query.includes('days') || query.includes('trip') || query.includes('route')) {
    return `### 🗺️ Tailor-Made Pakistan Travel Plans

You can generate a complete day-by-day travel plan with daily sights, famous regional dishes, and estimated PKR budgets in seconds using our [Itinerary Planner](/planner).

- **Top Regions:** Explore [Hunza Valley](/destinations/hunza-valley), [Skardu](/destinations/skardu), or [Lahore](/destinations/lahore).
- **🏨 Seamless Hotel Bookings:** Pair your itinerary with premium partner stays like [Hunza Serena Inn](/hotels/hunza-serena-inn) or [Pearl Continental Hotel Lahore](/hotels/pearl-continental-lahore) to guarantee comfort and hassle-free lodging throughout your trip!`;
  }

  // 8. General conversational greeting / fallback
  return `### Assalam-o-Alaikum! Welcome to myjourney.pk 🇵🇰

I am your official AI Travel Guide & Hospitality Concierge. How can I help you explore Pakistan today?

- **Scenic Destinations:** Discover [Hunza Valley](/destinations/hunza-valley), [Skardu](/destinations/skardu), or [Swat Valley](/destinations/swat-valley).
- **Heritage & Food:** Tour the cultural wonders of [Lahore](/destinations/lahore).
- **🏨 Featured Partner Hotels:** Find and book luxury stays like [Hunza Serena Inn](/hotels/hunza-serena-inn) or [Pearl Continental Hotel Lahore](/hotels/pearl-continental-lahore).
- **Trip Tools:** Build an instant multi-day route on our [Itinerary Planner](/planner) or read traveler stories on [Travel Blogs](/blogs).

Which destination or hotel are you interested in today?`;
};

/**
 * Main conversational AI Chat handler.
 * Formulates prompt grounded in platform destinations and hotels,
 * interacts with Google Gemini API via @google/genai, and returns
 * structured assistant response with graceful fallback to high-fidelity mock.
 *
 * @async
 * @param {string} message - User's latest input message.
 * @param {Array<{ role: 'user' | 'model', text: string }>} [conversationHistory=[]] - Optional chat history.
 * @returns {Promise<string>} Markdown-formatted assistant response.
 */
export const generateChatReply = async (message, conversationHistory = []) => {
  if (!message || typeof message !== 'string' || !message.trim()) {
    const error = new Error('Message is required and must be a non-empty string.');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch lightweight platform context (Destinations and Hotels)
  const platformContext = await getPlatformContext();
  const systemPrompt = buildSystemPrompt(platformContext);

  // 2. Retrieve Gemini client
  const genAI = getGeminiClient();

  if (!genAI) {
    console.log('ℹ️ [aiChatService] GEMINI_API_KEY is not configured. Utilizing mock travel guide fallback.');
    return generateMockChatReply(message);
  }

  // 3. Format multi-turn conversation contents for @google/genai
  const contents = [];

  if (Array.isArray(conversationHistory)) {
    for (const turn of conversationHistory) {
      if (turn && typeof turn.text === 'string' && turn.text.trim()) {
        const role = turn.role === 'model' || turn.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: turn.text.trim() }],
        });
      }
    }
  }

  // Append the current user message
  contents.push({
    role: 'user',
    parts: [{ text: message.trim() }],
  });

  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  try {
    const response = await genAI.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const replyText = response.text?.trim();

    if (!replyText) {
      throw new Error('Received empty response from Gemini model.');
    }

    return replyText;
  } catch (apiError) {
    console.warn(`⚠️ [aiChatService] Gemini API call failed (${apiError.message}). Utilizing high-fidelity mock fallback.`);
    return generateMockChatReply(message);
  }
};

export default {
  generateChatReply,
  generateMockChatReply,
  getPlatformContext,
  buildSystemPrompt,
  getGeminiClient,
};

