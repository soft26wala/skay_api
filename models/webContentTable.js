import database from "../database/db.js";

export async function createWebContentTables() {
  try {
    // 1. Categories Table
    await database.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        image TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await database.query(`ALTER TABLE categories ALTER COLUMN id TYPE VARCHAR(100);`);
    } catch (_) {}

    // Seed default categories if empty
    try {
      const catCheck = await database.query(`SELECT COUNT(*) FROM categories;`);
      if (parseInt(catCheck.rows[0].count, 10) === 0) {
        const defaultCategories = [
          {
            "id": "cat-1",
            "name": "Skincare & Serums",
            "image": "/new/hero/img1.png",
            "description": "Rejuvenating face serums, night oils & radiant skincare elixirs"
          },
          {
            "id": "cat-2",
            "name": "Hair Care & Oils",
            "image": "/new/hero/img2.png",
            "description": "Follicle nourishing botanical oils, serums & scalp vitality"
          },
          {
            "id": "cat-3",
            "name": "Body & Bath Luxury",
            "image": "/new/hero/img3.png",
            "description": "Artisanal body polish, exfoliating scrubs & deep hydration"
          },
          {
            "id": "cat-4",
            "name": "Wellness & Daily Vitality",
            "image": "/new/hero/downside/des.png",
            "description": "Clean daily wellness, natural energy & essential vitality boosters"
          },
          {
            "id": "cat-5",
            "name": "Organic Teas & Infusions",
            "image": "/new/hero/downside/code.jfif",
            "description": "Handcrafted loose leaf herbal teas & restorative botanical brews"
          },
          {
            "id": "cat-6",
            "name": "Aromatherapy & Essential Oils",
            "image": "/new/hero/downside/deploy.jfif",
            "description": "Pure steam-distilled essential oils, room mists & diffusers"
          },
          {
            "id": "cat-7",
            "name": "Men's Grooming",
            "image": "/new/hero/client/lab.png",
            "description": "Premium beard care, grooming oils & precision after-shave elixirs"
          },
          {
            "id": "cat-8",
            "name": "Sleep & Relaxation",
            "image": "/new/hero/client/met.png",
            "description": "Calming botanical blends & nighttime drops for restorative rest"
          }
        ];

        for (const cat of defaultCategories) {
          await database.query(
            `INSERT INTO categories (id, name, image, description) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING;`,
            [cat.id, cat.name, cat.image, cat.description]
          );
        }
      }
    } catch (e) {
      console.warn("Categories count/seed notice:", e.message);
    }

    // 2. Hero Slides Table (allows 3+ images dynamically)
    await database.query(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id VARCHAR(100) PRIMARY KEY,
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

    try {
      await database.query(`ALTER TABLE hero_slides ALTER COLUMN id TYPE VARCHAR(100);`);
    } catch (_) {}

    try {
      const heroCheck = await database.query(`SELECT COUNT(*) FROM hero_slides;`);
      if (parseInt(heroCheck.rows[0].count, 10) === 0) {
        const defaultHeroSlides = [
          {
            id: "hero-1",
            badge: "Artisanal Harvest 2026",
            title: "Sacred Botanical Wisdom",
            subtitle: "Botanical Alchemy For Discriminating Rituals",
            image: "/new/hero/img1.png",
            link: "/products",
            cta_text: "Explore Collection",
            display_order: 1,
          },
          {
            id: "hero-2",
            badge: "Small-Batch Formulations",
            title: "Single-Origin Potency",
            subtitle: "Chromatographically Certified Herbal Elixirs",
            image: "/new/hero/img2.png",
            link: "/products",
            cta_text: "View Formulations",
            display_order: 2,
          },
          {
            id: "hero-3",
            badge: "Holistic Refinement",
            title: "Sacred Self-Care Sanctuary",
            subtitle: "Elevating Daily Rituals Into Transformative Wellbeing",
            image: "/new/hero/img3.png",
            link: "/about",
            cta_text: "Our Philosophy",
            display_order: 3,
          },
        ];

        for (const h of defaultHeroSlides) {
          await database.query(
            `INSERT INTO hero_slides (id, title, subtitle, badge, image, link, cta_text, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING;`,
            [h.id, h.title, h.subtitle, h.badge, h.image, h.link, h.cta_text, h.display_order]
          );
        }
      }
    } catch (e) {
      console.warn("Hero slides seed notice:", e.message);
    }

    // 3. Sanctum Spaces Table
    await database.query(`
      CREATE TABLE IF NOT EXISTS sanctum_spaces (
        id VARCHAR(100) PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        src TEXT NOT NULL,
        badge VARCHAR(100) DEFAULT 'Atelier Sanctum',
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await database.query(`ALTER TABLE sanctum_spaces ALTER COLUMN id TYPE VARCHAR(100);`);
    } catch (_) {}

    try {
      const sanctumCheck = await database.query(`SELECT COUNT(*) FROM sanctum_spaces;`);
      if (parseInt(sanctumCheck.rows[0].count, 10) === 0) {
        const defaultSpaces = [
          { id: "sp-1", src: "/new/hero/client/ofc.png", label: "Consultation Sanctum", badge: "Atelier Sanctum", display_order: 1 },
          { id: "sp-2", src: "/new/hero/client/met.png", label: "Artisanal Dispensing Suite", badge: "Atelier Sanctum", display_order: 2 },
          { id: "sp-3", src: "/new/hero/client/lab.png", label: "Botanical Extraction Lab", badge: "Atelier Sanctum", display_order: 3 },
          { id: "sp-4", src: "/new/hero/client/office.png", label: "Therapeutic Chamber", badge: "Atelier Sanctum", display_order: 4 },
          { id: "sp-5", src: "/new/hero/client/sms.png", label: "Herbal Reserve Vault", badge: "Atelier Sanctum", display_order: 5 },
          { id: "sp-6", src: "/new/hero/client/des.png", label: "Master Formulators", badge: "Atelier Sanctum", display_order: 6 },
          { id: "sp-7", src: "/new/hero/client/ana.png", label: "Diagnostic Wellness Desk", badge: "Atelier Sanctum", display_order: 7 },
          { id: "sp-8", src: "/new/hero/client/storage.png", label: "Climate-Controlled Cellar", badge: "Atelier Sanctum", display_order: 8 },
        ];

        for (const s of defaultSpaces) {
          await database.query(
            `INSERT INTO sanctum_spaces (id, label, src, badge, display_order)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING;`,
            [s.id, s.label, s.src, s.badge, s.display_order]
          );
        }
      }
    } catch (e) {
      console.warn("Sanctum spaces seed notice:", e.message);
    }

    // 4. Why Choose Features Table
    await database.query(`
      CREATE TABLE IF NOT EXISTS why_choose_features (
        id VARCHAR(100) PRIMARY KEY,
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

    try {
      await database.query(`ALTER TABLE why_choose_features ALTER COLUMN id TYPE VARCHAR(100);`);
    } catch (_) {}

    try {
      const whyCheck = await database.query(`SELECT COUNT(*) FROM why_choose_features;`);
      if (parseInt(whyCheck.rows[0].count, 10) === 0) {
        const defaultWhyChoose = [
          {
            id: "wc-1",
            feature_number: "01",
            title: "Certified Organic Canadian Ingredients",
            subtitle: "100% Pure Botanical Purity",
            description: "Skay Products is good because we never compromise on ingredient integrity. Every formulation is made with 100% certified organic, ethically harvested Canadian and global botanicals. Free from harsh chemicals, synthetic fillers, parabens, and sulfates, our products deliver deep, gentle, and trustworthy nourishment for all skin types.",
            image: "https://res.cloudinary.com/deuihz0dq/image/upload/v1793279789/SkayProducts_Web/skay_purity_1793279788398.jpg",
            icon_name: "Leaf",
            is_reverse: false,
            display_order: 1,
          },
          {
            id: "wc-2",
            feature_number: "02",
            title: "Clinical Precision & Cold-Pressed Potency",
            subtitle: "Scientifically Proven Efficacy",
            description: "Skay Products is good because of our advanced, scientifically backed extraction methods. While conventional heat processing destroys sensitive nutrients and enzymes, our signature cold-press extraction retains 100% active cellular vitamins and antioxidants, ensuring visible, long-lasting rejuvenation and vitality.",
            image: "https://res.cloudinary.com/deuihz0dq/image/upload/v1793279791/SkayProducts_Web/skay_science_1793279793366.jpg",
            icon_name: "Activity",
            is_reverse: true,
            display_order: 2,
          },
          {
            id: "wc-3",
            feature_number: "03",
            title: "Handcrafted Small Batches in Protective Miron Glass",
            subtitle: "Artisanal Integrity & Freshness",
            description: "Skay Products is good because every single item is blended in small, handcrafted batches right here in Canada under strict quality standards. To guarantee maximum freshness and longevity, we house our formulations in biophotonic UV-filtering dark glass that shields delicate energetic botanical compounds from photodegradation.",
            image: "https://res.cloudinary.com/deuihz0dq/image/upload/v1793279793/SkayProducts_Web/skay_packaging_1793279795120.jpg",
            icon_name: "ShieldCheck",
            is_reverse: false,
            display_order: 3,
          },
        ];

        for (const w of defaultWhyChoose) {
          await database.query(
            `INSERT INTO why_choose_features (id, feature_number, title, subtitle, description, image, icon_name, is_reverse, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO NOTHING;`,
            [w.id, w.feature_number, w.title, w.subtitle, w.description, w.image, w.icon_name, w.is_reverse, w.display_order]
          );
        }
      }
    } catch (e) {
      console.warn("Why choose seed notice:", e.message);
    }

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

      const bgCheck = await database.query(`SELECT COUNT(*) FROM site_settings WHERE key = 'site_background';`);
      if (parseInt(bgCheck.rows[0].count, 10) === 0) {
        const defaultBg = {
          theme: "sky-day",
          enableClouds: true,
          cloudSpeed: "normal",
          cloudDensity: "high",
          cloudOpacity: 90,
          applyToAdmin: false,
          preset1: {
            id: "sky-day",
            name: "Day Azure Sky",
            subtitle: "Crisp Blue & Horizon Morning Azure",
            color1: "#1d8cf8",
            color2: "#bae6fd",
            angle: "180deg",
            cloudColor: "#ffffff",
          },
          preset2: {
            id: "sky-sunset",
            name: "Sunset Horizon Sky",
            subtitle: "Warm Sunset Orange & Twilight Lavender",
            color1: "#ea580c",
            color2: "#6366f1",
            angle: "160deg",
            cloudColor: "#fff7ed",
          },
          custom: {
            id: "custom",
            name: "Custom Sky Colors",
            subtitle: "Personalized Dual Color Sky",
            color1: "#0284c7",
            color2: "#7dd3fc",
            angle: "180deg",
            cloudColor: "#ffffff",
          },
          cardStyle: {
            bg: "#ffffff",
            bgOpacity: 95,
            textColor: "#1f2937",
            categoryColor: "#b98822",
            priceColor: "#b98822",
            btnBg: "#b98822",
            btnTextColor: "#ffffff",
            borderColor: "rgba(220, 210, 190, 0.7)",
          },
        };
        await database.query(
          `INSERT INTO site_settings (key, value) VALUES ('site_background', $1) ON CONFLICT (key) DO NOTHING;`,
          [JSON.stringify(defaultBg)]
        );
      }
    } catch (e) {
      console.warn("Site settings seed notice:", e.message);
    }

    // 6. Navigation Menu Table (Dynamic Storefront Header & Mobile Links)
    await database.query(`
      CREATE TABLE IF NOT EXISTS navigation_menu (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        path VARCHAR(255) NOT NULL,
        badge VARCHAR(50) DEFAULT '',
        is_active BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      const menuCheck = await database.query(`SELECT COUNT(*) FROM navigation_menu;`);
      if (parseInt(menuCheck.rows[0].count, 10) === 0) {
        const defaultNavItems = [
          { id: "nav-1", name: "Shop All", path: "/products", badge: "", display_order: 1 },
          { id: "nav-2", name: "Best Sellers", path: "/products?filter=best-sellers", badge: "Popular", display_order: 2 },
          { id: "nav-3", name: "About Us", path: "/about", badge: "", display_order: 3 },
          { id: "nav-4", name: "Contact", path: "/contact", badge: "", display_order: 4 },
          { id: "nav-5", name: "FAQ", path: "/faq", badge: "", display_order: 5 },
        ];
        for (const item of defaultNavItems) {
          await database.query(
            `INSERT INTO navigation_menu (id, name, path, badge, is_active, display_order)
             VALUES ($1, $2, $3, $4, true, $5) ON CONFLICT (id) DO NOTHING;`,
            [item.id, item.name, item.path, item.badge, item.display_order]
          );
        }
      }
    } catch (e) {
      console.warn("Navigation menu seed notice:", e.message);
    }
  } catch (error) {
    console.error("Failed to create web content tables:", error.message || error);
  }
}
