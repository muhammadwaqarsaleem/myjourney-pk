/**
 * @fileoverview Seed script for populating the database with curated Pakistani tourist destinations,
 * co-located heritage sites, and authentic regional culinary specialties.
 * @module utils/seedDestinations
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from '../models/Destination.js';
import User from '../models/User.js';

// Initialize environment variables from .env
dotenv.config();

const sampleDestinations = [
  {
    name: 'Lahore',
    slug: 'lahore',
    province: 'Punjab',
    description:
      'The vibrant cultural capital of Pakistan, Lahore is a millennium-old metropolis famed for its majestic Mughal architecture, bustling walled city bazaars, lush Shalimar gardens, and globally renowned culinary culture.',
    bannerImage:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1622546758596-f1f06ba11f58?auto=format&fit=crop&w=800&q=80',
        caption: 'Badshahi Mosque grand courtyard illuminated at dusk',
      },
      {
        url: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
        caption: 'Sheesh Mahal inside the historic Lahore Fort',
      },
      {
        url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=800&q=80',
        caption: 'Intricate glazed tile mosaic at Wazir Khan Mosque',
      },
    ],
    bestTimeToVisit: 'October to March (Pleasant, mild weather)',
    climateInfo:
      'Semi-arid climate with pleasant winters (10°C to 22°C) and hot summers (May to July) reaching upwards of 40°C.',
    coordinates: {
      lat: 31.5204,
      lng: 74.3587,
    },
    sitesToVisit: [
      {
        name: 'Badshahi Mosque',
        description:
          'Constructed in 1673 by Mughal Emperor Aurangzeb, this red sandstone landmark features vast marble domes and an iconic courtyard accommodating over 100,000 worshippers.',
        image:
          'https://images.unsplash.com/photo-1622546758596-f1f06ba11f58?auto=format&fit=crop&w=600&q=80',
        category: 'Historical',
        ticketInfo: 'Free entry for all visitors',
      },
      {
        name: 'Lahore Fort (Shahi Qila)',
        description:
          'A UNESCO World Heritage Citadel showcasing centuries of Mughal, Sikh, and British imperial history, including the famed Palace of Mirrors (Sheesh Mahal).',
        image:
          'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
        category: 'Historical',
        ticketInfo: 'PKR 50 (Domestic visitors), PKR 500 (Foreign nationals)',
      },
      {
        name: 'Shalimar Gardens',
        description:
          'Persian-style tripartite Mughal pleasure garden constructed in 1641 featuring 410 fountains, marble pavilions, and cascading waterfalls.',
        image:
          'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=600&q=80',
        category: 'Cultural',
        ticketInfo: 'PKR 50 per visitor',
      },
      {
        name: 'Wazir Khan Mosque',
        description:
          '17th-century masterpiece located deep within the Walled City, renowned for the most ornate fresco art and glazed kashi-kari tile mosaics in the subcontinent.',
        image:
          'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=600&q=80',
        category: 'Religious',
        ticketInfo: 'Free entry',
      },
    ],
    famousFoods: [
      {
        name: 'Phaddi Nihari',
        description:
          'Slow-simmered beef shank and bone marrow stew cooked overnight with aromatic spices, garnished with ginger, green chilies, and fresh lemon.',
        image:
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Waris Nihari, Abkari Road, Anarkali Bazar',
      },
      {
        name: 'Desi Ghee Mutton Karahi',
        description:
          'Tender mutton cooked in pure country butter (desi ghee), ripe red tomatoes, black pepper, and ginger in a smoking iron wok.',
        image:
          'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Butt Karahi Tikka, Lakshmi Chowk & Temple Road',
      },
      {
        name: 'Traditional Rabri Kulfi Falooda',
        description:
          'Dense clotted-milk kulfi served on a bed of silky vermicelli noodles, steeped in fragrant rose syrup and chilled condensed rabri.',
        image:
          'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Riaz Falooda, Anarkali Bazar',
      },
    ],
    averageRating: 4.8,
    reviewCount: 342,
  },
  {
    name: 'Hunza Valley',
    slug: 'hunza-valley',
    province: 'Gilgit-Baltistan',
    description:
      'A majestic alpine sanctuary in the heart of the Karakoram Mountain range. Celebrated for azure glacial lakes, ancient forts, long-lived communities, and snow-crested summits including Rakaposhi and Passu Cones.',
    bannerImage:
      'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
        caption: 'Turquoise waters of Attabad Lake nestled between steep Karakoram canyon walls',
      },
      {
        url: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
        caption: 'Historic Baltit Fort presiding over the terraced fields of Karimabad',
      },
      {
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        caption: 'Passu Cones standing sharp against the northern sky',
      },
    ],
    bestTimeToVisit: 'April to October (Cherry blossoms in Spring, Golden Autumn in October)',
    climateInfo:
      'Crisp high-altitude mountain climate. Pleasant summers (18°C to 28°C) and cold winters (-10°C to 5°C) with regular snowfall.',
    coordinates: {
      lat: 36.3167,
      lng: 74.65,
    },
    sitesToVisit: [
      {
        name: 'Baltit Fort',
        description:
          'Over 800 years old, this Tibetan-influenced royal residence sits high above Karimabad offering breathtaking panoramic valley views and UNESCO heritage curation.',
        image:
          'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=600&q=80',
        category: 'Historical',
        ticketInfo: 'PKR 400 (Domestic), PKR 1,200 (International)',
      },
      {
        name: 'Attabad Lake',
        description:
          'A luminous blue mountain lake formed in 2010 after a massive landslide. A premier hub for boating, jet-skiing, and lakeside camping.',
        image:
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80',
        category: 'Natural',
        ticketInfo: 'Boating rides PKR 1,000 to 2,500 per group',
      },
      {
        name: 'Passu Cones & Suspension Bridge',
        description:
          'Dramatic razor-sharp serrated peaks towering over the Hunza River, paired with the thrilling wooden-plank Passu Suspension Bridge.',
        image:
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        category: 'Adventure',
        ticketInfo: 'PKR 100 bridge preservation fee',
      },
      {
        name: "Eagle's Nest (Duikar Viewpoint)",
        description:
          'The highest viewpoint in Hunza accessible by vehicle, offering 360-degree sunrise and sunset views of Rakaposhi, Ultar Sar, and Golden Peak.',
        image:
          'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
        category: 'Natural',
        ticketInfo: 'Free access',
      },
    ],
    famousFoods: [
      {
        name: 'Chapshuro',
        description:
          'The famous Hunza meat pie, packed with seasoned beef or yak mince, fresh mountain herbs, mint, and onions, griddled inside a crispy whole-wheat pocket.',
        image:
          'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Hunza Food Pavilion by Kha Basi, Karimabad',
      },
      {
        name: 'Gyaling with Apricot Oil',
        description:
          'Traditional whole-wheat flatbread crepes served hot, drenched in cold-pressed local organic apricot kernel oil and paired with mountain herbal tea (Tumuro).',
        image:
          'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Al-Barakat Local Cuisine, Karimabad',
      },
      {
        name: 'Organic Hunza Apricot Cake',
        description:
          'Warm, dense slice made with local sundried apricots, crushed apricot kernels, and mountain honey, served fresh with rich espresso.',
        image:
          'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Café de Hunza, Karimabad Main Bazaar',
      },
    ],
    averageRating: 4.9,
    reviewCount: 518,
  },
  {
    name: 'Swat Valley',
    slug: 'swat-valley',
    province: 'Khyber Pakhtunkhwa',
    description:
      "Celebrated as the 'Switzerland of the East' for its roaring turquoise rivers, dense cedar forests, alpine lakes, and ancient Gandhara Buddhist heritage, Swat Valley is an unmissable destination for nature and adventure seekers.",
    bannerImage:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
        caption: 'Evergreen deodar forests and rolling mist across Kalam Valley',
      },
      {
        url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
        caption: 'Mahodand alpine lake bordered by wildflowers',
      },
    ],
    bestTimeToVisit: 'May to October for valley tours; December to February for skiing',
    climateInfo:
      'Alpine temperate climate with cool pleasant summers (15°C to 25°C) and snowy winters (-5°C to 8°C).',
    coordinates: {
      lat: 35.2227,
      lng: 72.4258,
    },
    sitesToVisit: [
      {
        name: 'Mahodand Lake',
        description:
          'A pristine glacial lake located 40km above Kalam at an elevation of 9,400 ft, surrounded by pine forests, roaring river feeds, and snowcapped peaks.',
        image:
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
        category: 'Natural',
        ticketInfo: '4x4 Jeep hire required from Kalam (approx. PKR 6,000 - 8,000)',
      },
      {
        name: 'Malam Jabba Ski Resort',
        description:
          'Pakistan premier high-altitude ski resort equipped with an 800-meter ski slope, twin chairlifts, ziplines, and panoramic vistas of the Hindu Kush.',
        image:
          'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
        category: 'Adventure',
        ticketInfo: 'Chairlift ride PKR 1,000 per person',
      },
      {
        name: 'White Palace (Sufed Mahal) Marghazar',
        description:
          'Historic 1941 royal summer residence built by the first King of Swat (Miangul Abdul Wadud) using the exact same white marble quarried for the Taj Mahal.',
        image:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
        category: 'Historical',
        ticketInfo: 'PKR 100 per visitor',
      },
    ],
    famousFoods: [
      {
        name: 'Swat Pan-Fried Trout Fish',
        description:
          'Freshly netted cold-water river trout, lightly coated with organic spices and salt, pan-fried in butter and served with spicy mint chutney and naan.',
        image:
          'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Chail Trout Fish Farm & Restaurant, Madyan',
      },
      {
        name: 'Swati Beef Chapli Kabab',
        description:
          'Large, crispy minced beef patties enriched with dry pomegranate seeds (anardana), coriander, tomatoes, and fried in bone marrow fat.',
        image:
          'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
        mustTrySpot: 'Mingora Central Bazar Shinwari House',
      },
    ],
    averageRating: 4.7,
    reviewCount: 220,
  },
];

/**
 * Executes the database seeding process.
 */
const seedDatabase = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ Database Seeder Error: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ Connected to MongoDB.');

    // Look for an existing admin or creator user to assign as creator
    const creatorUser = await User.findOne({ role: { $in: ['admin', 'creator'] } });
    const defaultCreatorId = creatorUser ? creatorUser._id : null;

    if (creatorUser) {
      console.log(`👤 Linking starter destinations to user: ${creatorUser.name} (${creatorUser.email})`);
    } else {
      console.log('ℹ️ No admin/creator user found. Destinations will be seeded without a createdBy link.');
    }

    // Attach creator ID to each destination
    const destinationsWithCreator = sampleDestinations.map((dest) => ({
      ...dest,
      createdBy: defaultCreatorId,
    }));

    // Remove existing seed destinations with matching names to avoid duplicate errors
    const namesToClean = sampleDestinations.map((d) => d.name);
    const deleteResult = await Destination.deleteMany({ name: { $in: namesToClean } });
    console.log(`🧹 Cleared ${deleteResult.deletedCount} existing sample destination(s).`);

    // Insert new starter destinations
    const inserted = await Destination.insertMany(destinationsWithCreator);
    console.log(`🎉 Successfully seeded ${inserted.length} starter destinations:`);
    inserted.forEach((d) => {
      console.log(`   - 📍 ${d.name} (${d.province}) | Slug: /${d.slug} | Sites: ${d.sitesToVisit.length} | Foods: ${d.famousFoods.length}`);
    });

    await mongoose.connection.close();
    console.log('🔒 Database connection closed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('💥 Database seeding failed:', error);
    try {
      await mongoose.connection.close();
    } catch {
      // Ignore disconnect error on exit
    }
    process.exit(1);
  }
};

seedDatabase();
