/**
 * @fileoverview Seed script and helper for populating sample travelogues and blog posts.
 * Links realistic travel stories to existing Pakistani destinations and creator accounts.
 * @module utils/seedBlogs
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from '../models/Blog.js';
import Destination from '../models/Destination.js';
import User from '../models/User.js';

dotenv.config();

/**
 * Curated travelogues and blogs for seeding.
 */
export const sampleBlogs = [
  {
    title: '5-Day Hunza Autumn Itinerary',
    slug: '5-day-hunza-autumn-itinerary',
    excerpt:
      'Golden poplar trees, turquoise glacial waters, and snow-capped 7,000m Karakoram peaks. Here is the ultimate 5-day autumn road trip itinerary through Hunza Valley.',
    coverImage:
      'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1600&q=80',
    tags: ['Hunza', 'RoadTrip', 'AutumnColors', 'GilgitBaltistan', 'Adventure'],
    readTime: 5,
    status: 'published',
    views: 142,
    destinationSlug: 'hunza-valley',
    content: `# 5-Day Hunza Autumn Itinerary: Golden Leaves & Karakoram Peaks

Every October, the Hunza Valley in Gilgit-Baltistan undergoes a magical transformation. Thousands of apricot, cherry, and poplar trees turn into brilliant shades of gold, amber, and crimson against the dramatic backdrop of snow-draped 7,000-meter Karakoram giants.

Here is a tested day-by-day itinerary for an unforgettable autumn journey.

---

### Day 1: Arrival in Gilgit & Ascent to Karimabad
- **Morning**: Board the early morning ATR flight from Islamabad to Gilgit Airport (or arrive via the scenic Babusar Pass route).
- **Afternoon**: Drive north along the legendary Karakoram Highway (KKH). Pause at the **Rakaposhi View Point** in Ghulmet for fresh chapshuro and steaming milk tea right under the ice wall.
- **Evening**: Check in to your hotel in **Karimabad**. Watch the sunset illuminate the tips of Ultar Sar and Ladyfinger Peak.

---

### Day 2: 800 Years of Heritage – Baltit & Altit Forts
- **Morning**: Walk up the cobblestone alleyways of Karimabad to the **Baltit Fort**, an architectural marvel perched high on a rock spur.
- **Afternoon**: Descend into the historic royal gardens of **Altit Fort**. Sit beneath centuries-old apricot trees and taste authentic walnut cake at the local women-led artisan cafe.
- **Evening**: Head up to **Eagle's Nest (Duikar)** for the highest panoramic view of the entire valley during twilight.

---

### Day 3: Attabad Lake & Hussaini Hanging Bridge
- **Morning**: Drive through the Pak-China Friendship Tunnels to reach the luminous turquoise waters of **Attabad Lake**. Take an open wooden motorboat ride between sheer canyon cliffs.
- **Afternoon**: Test your courage crossing the swaying wooden planks of the **Hussaini Suspension Bridge** in Upper Hunza.
- **Evening**: Settle in Passu village with a warm bowl of traditional yak meat broth.

---

### Day 4: Passu Cones & Borith Lake
- **Morning**: Wake up to crisp sub-zero morning air framed by the jagged serrated towers of the **Passu Cathedral (Cones)**.
- **Midday**: Hike up the jeep track to **Borith Lake**, an isolated saline water sanctuary reflecting the white crests of Ghulkin Glacier.
- **Evening**: Stargaze under one of the darkest night skies in South Asia, with the Milky Way visible to the naked eye.

---

### Day 5: Khunjerab Pass – Border at the Edge of the Clouds
- **Full Day**: Drive towards the **Khunjerab National Park** and cross the highest paved international border in the world (4,693m) linking Pakistan with China. Watch out for Himalayan ibex and golden marmots along the way.
- **Return**: Head back towards Gilgit for your departure with memories etched forever in golden light.`,
  },
  {
    title: 'Old Lahore Food & Heritage Walk',
    slug: 'old-lahore-food-heritage-walk',
    excerpt:
      'A sensory journey through the 1,000-year-old Walled City of Lahore—exploring hidden courtyards, Mughal fresco masterpieces, and legendary street food gems.',
    coverImage:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1600&q=80',
    tags: ['Heritage', 'FoodWalk', 'Lahore', 'MughalArchitecture', 'StreetFood'],
    readTime: 6,
    status: 'published',
    views: 218,
    destinationSlug: 'lahore',
    content: `# Old Lahore Food & Heritage Walk: From Delhi Gate to Badshahi Mosque

Nothing in South Asia prepares your senses for the raw energy, intoxicating spices, and architectural grandeur of **Androon Shehr** (The Walled City of Lahore). Behind its ancient red-brick gates lies a living museum where Mughal, Sikh, and colonial histories intersect with centuries of culinary mastery.

---

### 1. Starting Point: Delhi Gate & Shahi Hammam
Step through the imposing archway of Delhi Gate into the Mughal era. Your first stop is the **Shahi Hammam (Royal Bathhouse)**, constructed in 1635 by Governor Ilam-ud-Din Ansari. Marvel at the fresco restorations, sunken hot-water pools, and innovative underground chimney hypocaust systems.

---

### 2. The Jewel of Lahore: Wazir Khan Mosque
Follow the winding bazaar lined with spice traders, brass craftsmen, and cloth merchants until you arrive at the courtyard of **Masjid Wazir Khan**. Widely regarded as the most ornately decorated mosque in the subcontinent, its exterior is wrapped in breathtaking glazed *kashi-kari* tile mosaics and delicate Persian calligraphy.

---

### 3. Morning Fuel: Waris Nihari in Anarkali
No morning walking tour is complete without tasting Lahore's benchmark breakfast. Head down to Abkari Road for **Phaddi Nihari**: slow-cooked tender beef shanks in rich bone-marrow gravy, topped with julienned ginger, chopped fresh coriander, and fiery green chilies served with piping hot tandoori khameeri rotis.

---

### 4. Shahi Qila (Lahore Fort) & Sheesh Mahal
Traverse past Taxali Gate towards the UNESCO World Heritage citadel of **Lahore Fort**. Walk through the monumental Elephant Stairs and pause inside the **Sheesh Mahal (Palace of Mirrors)**, where thousands of convex mirrors inlaid into the ceilings bounce every ray of candlelight.

---

### 5. Twilight Feast: Fort Road Food Street
As the sun dips below the horizon, climb up the narrow stairwell of a restored multi-story haveli on **Fort Road Food Street**. Order a sizzling iron wok of **Desi Ghee Mutton Karahi** alongside crisp garlic naans, while watching the illuminated red sandstone minarets and white marble domes of the **Badshahi Mosque** glow under the night sky.`,
  },
];

/**
 * Seeder helper to insert or update sample blogs linked to destinations and a creator author.
 *
 * @param {Array<Object>} destinations - List of saved destination documents.
 * @param {Object} [authorUser] - User document to assign as author.
 * @returns {Promise<Array<Object>>} List of inserted blog documents.
 */
export const seedSampleBlogs = async (destinations = [], authorUser = null) => {
  // If authorUser wasn't provided, lookup an admin or creator user
  let author = authorUser;
  if (!author) {
    author = await User.findOne({ role: { $in: ['admin', 'creator'] } });
  }

  // If still no user exists, lookup any user or create a fallback author
  if (!author) {
    author = await User.findOne();
  }

  const authorId = author ? author._id : new mongoose.Types.ObjectId();

  // Create a slug-to-ID lookup map for destinations
  const destinationMap = {};
  if (destinations && destinations.length > 0) {
    destinations.forEach((d) => {
      if (d.slug) destinationMap[d.slug] = d._id;
    });
  } else {
    const allDests = await Destination.find().select('slug _id');
    allDests.forEach((d) => {
      if (d.slug) destinationMap[d.slug] = d._id;
    });
  }

  // Map sample blogs to destination IDs and author
  const blogsToInsert = sampleBlogs.map((b) => {
    const destId = destinationMap[b.destinationSlug] || null;
    return {
      title: b.title,
      slug: b.slug,
      excerpt: b.excerpt,
      content: b.content,
      coverImage: b.coverImage,
      tags: b.tags,
      readTime: b.readTime,
      status: b.status,
      views: b.views,
      author: authorId,
      destination: destId,
      likes: [],
    };
  });

  // Remove existing sample blogs with matching slugs to allow clean idempotent re-runs
  const slugsToClean = sampleBlogs.map((b) => b.slug);
  await Blog.deleteMany({ slug: { $in: slugsToClean } });

  const insertedBlogs = await Blog.insertMany(blogsToInsert);
  return insertedBlogs;
};

/**
 * Standalone CLI runner for blog seeding.
 */
const runStandaloneBlogSeeder = async () => {
  // Only execute directly if script was invoked from CLI
  if (process.argv[1]?.includes('seedBlogs.js')) {
    try {
      const mongoUri =
        process.env.MONGO_URI ||
        'mongodb://localhost:27017/myjourneypk?retryWrites=true&w=majority';
      console.log('🔄 Connecting to MongoDB for standalone blog seeding...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB.');

      const seeded = await seedSampleBlogs();
      console.log(`🎉 Successfully seeded ${seeded.length} sample travelogues/blogs:`);
      seeded.forEach((b) => {
        console.log(`   - ✍️  ${b.title} | Slug: /${b.slug} | Read: ${b.readTime} min | Views: ${b.views}`);
      });

      await mongoose.connection.close();
      console.log('🔒 Database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('💥 Standalone blog seeding failed:', err);
      try {
        await mongoose.connection.close();
      } catch {
        // Ignore disconnect error
      }
      process.exit(1);
    }
  }
};

runStandaloneBlogSeeder();

export default seedSampleBlogs;
