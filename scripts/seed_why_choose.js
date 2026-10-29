import database from "../database/db.js";

async function seed() {
  try {
    await database.query("DELETE FROM why_choose_features;");

    const features = [
      {
        feature_number: "01",
        title: "Certified Organic Canadian Ingredients",
        subtitle: "100% Pure Botanical Purity",
        description:
          "Skay Products is good because we never compromise on ingredient integrity. Every formulation is made with 100% certified organic, ethically harvested Canadian and global botanicals. Free from harsh chemicals, synthetic fillers, parabens, and sulfates, our products deliver deep, gentle, and trustworthy nourishment for all skin types.",
        image:
          "https://res.cloudinary.com/deuihz0dq/image/upload/v1793279789/SkayProducts_Web/skay_purity_1793279788398.jpg",
        icon_name: "Leaf",
        is_reverse: false,
        display_order: 1,
      },
      {
        feature_number: "02",
        title: "Clinical Precision & Cold-Pressed Potency",
        subtitle: "Scientifically Proven Efficacy",
        description:
          "Skay Products is good because of our advanced, scientifically backed extraction methods. While conventional heat processing destroys sensitive nutrients and enzymes, our signature cold-press extraction retains 100% active cellular vitamins and antioxidants, ensuring visible, long-lasting rejuvenation and vitality.",
        image:
          "https://res.cloudinary.com/deuihz0dq/image/upload/v1793279791/SkayProducts_Web/skay_science_1793279793366.jpg",
        icon_name: "Activity",
        is_reverse: true,
        display_order: 2,
      },
      {
        feature_number: "03",
        title: "Handcrafted Small Batches in Protective Miron Glass",
        subtitle: "Artisanal Integrity & Freshness",
        description:
          "Skay Products is good because every single item is blended in small, handcrafted batches right here in Canada under strict quality standards. To guarantee maximum freshness and longevity, we house our formulations in biophotonic UV-filtering dark glass that shields delicate energetic botanical compounds from photodegradation.",
        image:
          "https://res.cloudinary.com/deuihz0dq/image/upload/v1793279793/SkayProducts_Web/skay_packaging_1793279795120.jpg",
        icon_name: "ShieldCheck",
        is_reverse: false,
        display_order: 3,
      },
    ];

    for (const f of features) {
      const res = await database.query(
        `INSERT INTO why_choose_features (feature_number, title, subtitle, description, image, icon_name, is_reverse, display_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, feature_number, title;`,
        [
          f.feature_number,
          f.title,
          f.subtitle,
          f.description,
          f.image,
          f.icon_name,
          f.is_reverse,
          f.display_order,
        ]
      );
      console.log("Seeded:", res.rows[0]);
    }
    console.log("Why Choose Skay Products successfully seeded into database!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
