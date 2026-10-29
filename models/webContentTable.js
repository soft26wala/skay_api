import database from "../database/db.js";

export async function createWebContentTables() {
  try {
    // 1. Categories Table
    await database.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        image TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default categories if empty
    try {
      const catCheck = await database.query(`SELECT COUNT(*) FROM categories;`);
      if (parseInt(catCheck.rows[0].count, 10) === 0) {
        const defaultCategories = [
  {
    "name": "Skincare & Serums",
    "image": "/new/hero/img1.png",
    "description": "Rejuvenating face serums, night oils & radiant skincare elixirs"
  },
  {
    "name": "Hair Care & Oils",
    "image": "/new/hero/img2.png",
    "description": "Follicle nourishing botanical oils, serums & scalp vitality"
  },
  {
    "name": "Body & Bath Luxury",
    "image": "/new/hero/img3.png",
    "description": "Artisanal body polish, exfoliating scrubs & deep hydration"
  },
  {
    "name": "Wellness & Daily Vitality",
    "image": "/new/hero/downside/des.png",
    "description": "Clean daily wellness, natural energy & essential vitality boosters"
  },
  {
    "name": "Organic Teas & Infusions",
    "image": "/new/hero/downside/code.jfif",
    "description": "Handcrafted loose leaf herbal teas & restorative botanical brews"
  },
  {
    "name": "Aromatherapy & Essential Oils",
    "image": "/new/hero/downside/deploy.jfif",
    "description": "Pure steam-distilled essential oils, room mists & diffusers"
  },
  {
    "name": "Men's Grooming",
    "image": "/new/hero/client/lab.png",
    "description": "Premium beard care, grooming oils & precision after-shave elixirs"
  },
  {
    "name": "Sleep & Relaxation",
    "image": "/new/hero/client/met.png",
    "description": "Calming botanical blends & nighttime drops for restorative rest"
  }
];

        for (const cat of defaultCategories) {
          await database.query(
            `INSERT INTO categories (name, image, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING;`,
            [cat.name, cat.image, cat.description]
          );
        }
      }
    } catch (e) {
      console.warn("Categories count/seed notice:", e.message);
    }

    // 2. Hero Slides Table (allows 3+ images dynamically)
    await database.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) DEFAULT '',
        subtitle VARCHAR(255) DEFAULT '',
        badge VARCHAR(100) DEFAULT '',
        image TEXT NOT NULL,
        link TEXT DEFAULT '/products',
        cta_text VARCHAR(100) DEFAULT 'Explore Collection',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Sanctum Spaces Table
    await database.query(`
      CREATE TABLE IF NOT EXISTS sanctum_spaces (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        src TEXT NOT NULL,
        badge VARCHAR(100) DEFAULT 'Atelier Sanctum',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Why Choose Features Table
    await database.query(`
      CREATE TABLE IF NOT EXISTS why_choose_features (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        feature_number VARCHAR(20) DEFAULT '01',
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT '',
        description TEXT NOT NULL,
        image TEXT DEFAULT '',
        icon_name VARCHAR(50) DEFAULT 'Activity',
        is_reverse BOOLEAN DEFAULT false,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Site Settings Table (for Top Announcement Bar & Store Configurations)
    await database.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      const settingCheck = await database.query(`SELECT COUNT(*) FROM site_settings WHERE key = 'announcement_bar';`);
      if (parseInt(settingCheck.rows[0].count, 10) === 0) {
        await database.query(
          `INSERT INTO site_settings (key, value) VALUES ('announcement_bar', $1) ON CONFLICT (key) DO NOTHING;`,
          ["Haute Formulation & Complimentary Concierge Delivery on Orders Above $75 CAD"]
        );
      }
    } catch (e) {
      console.warn("Site settings seed notice:", e.message);
    }
  } catch (error) {
    console.error("Failed to create web content tables:", error.message || error);
  }
}
