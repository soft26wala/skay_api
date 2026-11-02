import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from "cloudinary";
import database from "../database/db.js";
import fs from "fs";
import path from "path";

// In-memory fallback stores to ensure 100% continuous uptime even if DB is temporarily disconnected
let fallbackCategories = [
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

let fallbackHeroSlides = [
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

let fallbackSanctumSpaces = [
  { id: "sp-1", src: "/new/hero/client/ofc.png", label: "Consultation Sanctum", badge: "Atelier Sanctum", display_order: 1 },
  { id: "sp-2", src: "/new/hero/client/met.png", label: "Artisanal Dispensing Suite", badge: "Atelier Sanctum", display_order: 2 },
  { id: "sp-3", src: "/new/hero/client/lab.png", label: "Botanical Extraction Lab", badge: "Atelier Sanctum", display_order: 3 },
  { id: "sp-4", src: "/new/hero/client/office.png", label: "Therapeutic Chamber", badge: "Atelier Sanctum", display_order: 4 },
  { id: "sp-5", src: "/new/hero/client/sms.png", label: "Herbal Reserve Vault", badge: "Atelier Sanctum", display_order: 5 },
  { id: "sp-6", src: "/new/hero/client/des.png", label: "Master Formulators", badge: "Atelier Sanctum", display_order: 6 },
  { id: "sp-7", src: "/new/hero/client/ana.png", label: "Diagnostic Wellness Desk", badge: "Atelier Sanctum", display_order: 7 },
  { id: "sp-8", src: "/new/hero/client/storage.png", label: "Climate-Controlled Cellar", badge: "Atelier Sanctum", display_order: 8 },
];

let fallbackWhyChoose = [
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

// Helper to upload image if file is supplied:
// 1. Tries Cloudinary first (uploaded to folder 'SkayProducts_Web' and returns secure_url).
// 2. If Cloudinary credentials are not present or upload fails, persists file to server /uploads folder and returns full HTTP URL!
const handleImageUpload = async (reqFile, fallbackUrl = "") => {
  if (reqFile) {
    // 1. Try Cloudinary
    const cloudName = process.env.CLOUDINARY_CLIENT_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    if (cloudName && cloudName !== "your_cloudinary_client_name") {
      try {
        const filePath = reqFile.tempFilePath || reqFile.path;
        if (filePath) {
          const result = await cloudinary.uploader.upload(filePath, {
            folder: "SkayProducts_Web",
            width: 1400,
            crop: "scale",
          });
          if (result && result.secure_url) {
            return result.secure_url;
          }
        }
      } catch (e) {
        console.warn("Cloudinary upload failed, attempting local persistent save:", e.message);
      }
    }

    // 2. Fallback: Save persistently to local uploads folder
    try {
      const uploadDir = path.resolve("uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const ext = path.extname(reqFile.name || ".png") || ".png";
      const fileName = `web_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
      const destPath = path.join(uploadDir, fileName);

      if (reqFile.mv) {
        await reqFile.mv(destPath);
      } else if (reqFile.tempFilePath && fs.existsSync(reqFile.tempFilePath)) {
        fs.copyFileSync(reqFile.tempFilePath, destPath);
      } else if (reqFile.data) {
        fs.writeFileSync(destPath, reqFile.data);
      }

      const host = process.env.BACKEND_URL || "http://localhost:4000";
      return `${host}/uploads/${fileName}`;
    } catch (localErr) {
      console.error("Local file persistent save error:", localErr);
    }
  }
  return fallbackUrl;
};

/* =====================================================================
   1. CATEGORIES CONTROLLER
===================================================================== */
export const getCategories = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await database.query(`SELECT * FROM categories ORDER BY created_at ASC;`);
    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        categories: result.rows,
      });
    }
  } catch (error) {
    console.warn("Database query failed for categories, using fallback:", error.message);
  }

  res.status(200).json({
    success: true,
    categories: fallbackCategories,
  });
});

export const createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return next(new ErrorHandler("Category name is required.", 400));
  }

  let imageUrl = req.body.image || "";
  if (req.files && req.files.image) {
    imageUrl = await handleImageUpload(req.files.image, imageUrl);
  }

  if (!imageUrl) {
    imageUrl = "/new/hero/img1.png";
  }

  try {
    const result = await database.query(
      `INSERT INTO categories (name, image, description) VALUES ($1, $2, $3) RETURNING *;`,
      [name.trim(), imageUrl, description || ""]
    );
    const newCat = result.rows[0];
    fallbackCategories.push(newCat);
    return res.status(201).json({
      success: true,
      message: "Category created successfully in database.",
      category: newCat,
    });
  } catch (error) {
    console.warn("Database error on category insert, saving in memory:", error.message);
    const newCat = {
      id: "cat-" + Date.now(),
      name: name.trim(),
      image: imageUrl,
      description: description || "",
      created_at: new Date().toISOString(),
    };
    fallbackCategories.push(newCat);
    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category: newCat,
    });
  }
});

export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    await database.query(`DELETE FROM categories WHERE id::text = $1 OR name = $1;`, [id]);
  } catch (error) {
    console.warn("Database error on category delete:", error.message);
  }
  fallbackCategories = fallbackCategories.filter((c) => c.id !== id && c.name !== id);
  res.status(200).json({
    success: true,
    message: "Category deleted successfully.",
  });
});

export const updateCategory = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  let imageUrl = req.body.image;
  if (req.files && req.files.image) {
    imageUrl = await handleImageUpload(req.files.image, imageUrl);
  }

  let oldName = null;
  try {
    const existing = await database.query(`SELECT * FROM categories WHERE id::text = $1 OR name = $1;`, [id]);
    if (existing && existing.rows && existing.rows.length > 0) {
      oldName = existing.rows[0].name;
    }
  } catch (e) {
    console.warn("DB check category notice:", e.message);
  }

  let updatedCat = null;
  try {
    const query = `
      UPDATE categories
      SET name = COALESCE($1, name),
          image = COALESCE($2, image),
          description = COALESCE($3, description)
      WHERE id::text = $4 OR name = $4
      RETURNING *;
    `;
    const result = await database.query(query, [
      name ? name.trim() : null,
      imageUrl !== undefined ? imageUrl : null,
      description !== undefined ? description : null,
      id,
    ]);
    if (result && result.rows && result.rows.length > 0) {
      updatedCat = result.rows[0];
      if (oldName && name && oldName !== name.trim()) {
        try {
          await database.query(`UPDATE products SET category = $1 WHERE category = $2;`, [name.trim(), oldName]);
        } catch (pe) {
          console.warn("Update products category notice:", pe.message);
        }
      }
    }
  } catch (error) {
    console.warn("Database error on category update:", error.message);
  }

  const idx = fallbackCategories.findIndex((c) => c.id === id || c.name === id || (oldName && c.name === oldName));
  if (idx !== -1) {
    fallbackCategories[idx] = {
      ...fallbackCategories[idx],
      ...(name && { name: name.trim() }),
      ...(imageUrl !== undefined && { image: imageUrl }),
      ...(description !== undefined && { description: description }),
    };
    if (!updatedCat) updatedCat = fallbackCategories[idx];
  }

  if (!updatedCat) {
    updatedCat = { id, name: name || oldName || "Category", image: imageUrl || "", description: description || "" };
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully.",
    category: updatedCat,
  });
});

/* =====================================================================
   2. HERO SLIDES CONTROLLER (3+ Images dynamically)
===================================================================== */
export const getHeroSlides = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await database.query(`SELECT * FROM hero_slides ORDER BY display_order ASC, created_at ASC;`);
    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        slides: result.rows,
      });
    }
  } catch (error) {
    console.warn("Database query failed for hero_slides, using fallback:", error.message);
  }

  res.status(200).json({
    success: true,
    slides: fallbackHeroSlides,
  });
});

export const createHeroSlide = catchAsyncErrors(async (req, res, next) => {
  const { title, subtitle, badge, link, cta_text, display_order } = req.body;

  let imageUrl = req.body.image || "";
  if (req.files && req.files.image) {
    imageUrl = await handleImageUpload(req.files.image, imageUrl);
  }

  if (!imageUrl) {
    return next(new ErrorHandler("Please provide an image for the hero slide.", 400));
  }

  const orderNum = parseInt(display_order, 10) || fallbackHeroSlides.length + 1;

  try {
    const result = await database.query(
      `INSERT INTO hero_slides (title, subtitle, badge, image, link, cta_text, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
      [
        title || "Sacred Formulation",
        subtitle || "Elevating daily wellness rituals",
        badge || "Artisanal Harvest",
        imageUrl,
        link || "/products",
        cta_text || "Explore Collection",
        orderNum,
      ]
    );
    const newSlide = result.rows[0];
    fallbackHeroSlides.push(newSlide);
    return res.status(201).json({
      success: true,
      message: "Hero slide added successfully.",
      slide: newSlide,
    });
  } catch (error) {
    console.warn("Database error on hero slide insert, saving in memory:", error.message);
    const newSlide = {
      id: "hero-" + Date.now(),
      title: title || "Sacred Formulation",
      subtitle: subtitle || "Elevating daily wellness rituals",
      badge: badge || "Artisanal Harvest",
      image: imageUrl,
      link: link || "/products",
      cta_text: cta_text || "Explore Collection",
      display_order: orderNum,
      created_at: new Date().toISOString(),
    };
    fallbackHeroSlides.push(newSlide);
    return res.status(201).json({
      success: true,
      message: "Hero slide added successfully.",
      slide: newSlide,
    });
  }
});

export const deleteHeroSlide = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    await database.query(`DELETE FROM hero_slides WHERE id::text = $1;`, [id]);
  } catch (error) {
    console.warn("Database error on hero slide delete:", error.message);
  }
  fallbackHeroSlides = fallbackHeroSlides.filter((s) => s.id !== id);
  res.status(200).json({
    success: true,
    message: "Hero slide deleted successfully.",
  });
});

export const updateHeroSlide = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { title, subtitle, badge, link, cta_text, display_order } = req.body;

  let imageUrl = req.body.image;
  if (req.files && req.files.image) {
    imageUrl = await handleImageUpload(req.files.image, imageUrl);
  }

  const orderNum = display_order !== undefined && display_order !== "" ? parseInt(display_order, 10) : null;

  let updatedSlide = null;
  try {
    const query = `
      UPDATE hero_slides
      SET title = COALESCE($1, title),
          subtitle = COALESCE($2, subtitle),
          badge = COALESCE($3, badge),
          image = COALESCE($4, image),
          link = COALESCE($5, link),
          cta_text = COALESCE($6, cta_text),
          display_order = COALESCE($7, display_order)
      WHERE id::text = $8
      RETURNING *;
    `;
    const result = await database.query(query, [
      title !== undefined ? title : null,
      subtitle !== undefined ? subtitle : null,
      badge !== undefined ? badge : null,
      imageUrl !== undefined ? imageUrl : null,
      link !== undefined ? link : null,
      cta_text !== undefined ? cta_text : null,
      orderNum,
      id,
    ]);
    if (result && result.rows && result.rows.length > 0) {
      updatedSlide = result.rows[0];
    }
  } catch (error) {
    console.warn("Database error on hero slide update:", error.message);
  }

  const idx = fallbackHeroSlides.findIndex((s) => s.id === id);
  if (idx !== -1) {
    fallbackHeroSlides[idx] = {
      ...fallbackHeroSlides[idx],
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(badge !== undefined && { badge }),
      ...(imageUrl !== undefined && { image: imageUrl }),
      ...(link !== undefined && { link }),
      ...(cta_text !== undefined && { cta_text }),
      ...(orderNum !== null && { display_order: orderNum }),
    };
    if (!updatedSlide) updatedSlide = fallbackHeroSlides[idx];
  }

  if (!updatedSlide) {
    updatedSlide = { id, title, subtitle, badge, image: imageUrl, link, cta_text };
  }

  res.status(200).json({
    success: true,
    message: "Hero slide updated successfully.",
    slide: updatedSlide,
  });
});

/* =====================================================================
   3. SANCTUM SPACES CONTROLLER ("Inside Our Wellness Sanctum")
===================================================================== */
export const getSanctumSpaces = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await database.query(`SELECT * FROM sanctum_spaces ORDER BY display_order ASC, created_at ASC;`);
    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        spaces: result.rows,
      });
    }
  } catch (error) {
    console.warn("Database query failed for sanctum_spaces, using fallback:", error.message);
  }

  res.status(200).json({
    success: true,
    spaces: fallbackSanctumSpaces,
  });
});

export const createSanctumSpace = catchAsyncErrors(async (req, res, next) => {
  const { label, badge, display_order } = req.body;
  if (!label || !label.trim()) {
    return next(new ErrorHandler("Sanctum space label is required.", 400));
  }

  let imageUrl = req.body.src || req.body.image || "";
  if (req.files && (req.files.src || req.files.image)) {
    const file = req.files.src || req.files.image;
    imageUrl = await handleImageUpload(file, imageUrl);
  }

  if (!imageUrl) {
    imageUrl = "/new/hero/client/ofc.png";
  }

  const orderNum = parseInt(display_order, 10) || fallbackSanctumSpaces.length + 1;

  try {
    const result = await database.query(
      `INSERT INTO sanctum_spaces (label, src, badge, display_order) VALUES ($1, $2, $3, $4) RETURNING *;`,
      [label.trim(), imageUrl, badge || "Atelier Sanctum", orderNum]
    );
    const newSpace = result.rows[0];
    fallbackSanctumSpaces.push(newSpace);
    return res.status(201).json({
      success: true,
      message: "Sanctum space added successfully.",
      space: newSpace,
    });
  } catch (error) {
    console.warn("Database error on sanctum insert, saving in memory:", error.message);
    const newSpace = {
      id: "sp-" + Date.now(),
      label: label.trim(),
      src: imageUrl,
      badge: badge || "Atelier Sanctum",
      display_order: orderNum,
      created_at: new Date().toISOString(),
    };
    fallbackSanctumSpaces.push(newSpace);
    return res.status(201).json({
      success: true,
      message: "Sanctum space added successfully.",
      space: newSpace,
    });
  }
});

export const deleteSanctumSpace = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    await database.query(`DELETE FROM sanctum_spaces WHERE id::text = $1;`, [id]);
  } catch (error) {
    console.warn("Database error on sanctum delete:", error.message);
  }
  fallbackSanctumSpaces = fallbackSanctumSpaces.filter((s) => s.id !== id);
  res.status(200).json({
    success: true,
    message: "Sanctum space deleted successfully.",
  });
});

export const updateSanctumSpace = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { label, badge, display_order } = req.body;

  let imageUrl = req.body.src || req.body.image;
  if (req.files && (req.files.src || req.files.image)) {
    const file = req.files.src || req.files.image;
    imageUrl = await handleImageUpload(file, imageUrl);
  }

  const orderNum = display_order !== undefined && display_order !== "" ? parseInt(display_order, 10) : null;

  let updatedSpace = null;
  try {
    const query = `
      UPDATE sanctum_spaces
      SET label = COALESCE($1, label),
          src = COALESCE($2, src),
          badge = COALESCE($3, badge),
          display_order = COALESCE($4, display_order)
      WHERE id::text = $5
      RETURNING *;
    `;
    const result = await database.query(query, [
      label !== undefined ? label : null,
      imageUrl !== undefined ? imageUrl : null,
      badge !== undefined ? badge : null,
      orderNum,
      id,
    ]);
    if (result && result.rows && result.rows.length > 0) {
      updatedSpace = result.rows[0];
    }
  } catch (error) {
    console.warn("Database error on sanctum space update:", error.message);
  }

  const idx = fallbackSanctumSpaces.findIndex((s) => s.id === id);
  if (idx !== -1) {
    fallbackSanctumSpaces[idx] = {
      ...fallbackSanctumSpaces[idx],
      ...(label !== undefined && { label }),
      ...(imageUrl !== undefined && { src: imageUrl }),
      ...(badge !== undefined && { badge }),
      ...(orderNum !== null && { display_order: orderNum }),
    };
    if (!updatedSpace) updatedSpace = fallbackSanctumSpaces[idx];
  }

  if (!updatedSpace) {
    updatedSpace = { id, label, src: imageUrl, badge };
  }

  res.status(200).json({
    success: true,
    message: "Sanctum space updated successfully.",
    space: updatedSpace,
  });
});

/* =====================================================================
   4. WHY CHOOSE FEATURES CONTROLLER ("Why Choose Skay Products")
===================================================================== */
export const getWhyChooseFeatures = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await database.query(`SELECT * FROM why_choose_features ORDER BY display_order ASC, created_at ASC;`);
    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        features: result.rows,
      });
    }
  } catch (error) {
    console.warn("Database query failed for why_choose_features, using fallback:", error.message);
  }

  res.status(200).json({
    success: true,
    features: fallbackWhyChoose,
  });
});

export const createWhyChooseFeature = catchAsyncErrors(async (req, res, next) => {
  const { title, subtitle, description, feature_number, icon_name, is_reverse, display_order } = req.body;
  if (!title || !description) {
    return next(new ErrorHandler("Feature title and description are required.", 400));
  }

  let imageUrl = req.body.image || "";
  if (req.files && req.files.image) {
    imageUrl = await handleImageUpload(req.files.image, imageUrl);
  }

  if (!imageUrl) {
    imageUrl = "/new/hero/downside/des.png";
  }

  const orderNum = parseInt(display_order, 10) || fallbackWhyChoose.length + 1;
  const isRev =
    is_reverse !== undefined && is_reverse !== null && is_reverse !== ""
      ? is_reverse === true || is_reverse === "true"
      : orderNum % 2 === 0;
  const featNum = feature_number || `0${orderNum}`;

  try {
    const result = await database.query(
      `INSERT INTO why_choose_features (feature_number, title, subtitle, description, image, icon_name, is_reverse, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
      [featNum, title.trim(), subtitle || "", description.trim(), imageUrl, icon_name || "Activity", isRev, orderNum]
    );
    const newFeat = result.rows[0];
    fallbackWhyChoose.push(newFeat);
    return res.status(201).json({
      success: true,
      message: "Why Choose feature created successfully.",
      feature: newFeat,
    });
  } catch (error) {
    console.warn("Database error on why choose insert, saving in memory:", error.message);
    const newFeat = {
      id: "wc-" + Date.now(),
      feature_number: featNum,
      title: title.trim(),
      subtitle: subtitle || "",
      description: description.trim(),
      image: imageUrl,
      icon_name: icon_name || "Activity",
      is_reverse: isRev,
      display_order: orderNum,
      created_at: new Date().toISOString(),
    };
    fallbackWhyChoose.push(newFeat);
    return res.status(201).json({
      success: true,
      message: "Why Choose feature created successfully.",
      feature: newFeat,
    });
  }
});

export const deleteWhyChooseFeature = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  try {
    await database.query(`DELETE FROM why_choose_features WHERE id::text = $1;`, [id]);
  } catch (error) {
    console.warn("Database error on why choose delete:", error.message);
  }
  fallbackWhyChoose = fallbackWhyChoose.filter((f) => f.id !== id);
  res.status(200).json({
    success: true,
    message: "Feature deleted successfully.",
  });
});

export const updateWhyChooseFeature = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { feature_number, title, subtitle, description, icon_name, is_reverse, display_order } = req.body;

  let imageUrl = req.body.image;
  if (req.files && req.files.image) {
    imageUrl = await handleImageUpload(req.files.image, imageUrl);
  }

  const orderNum = display_order !== undefined && display_order !== "" ? parseInt(display_order, 10) : null;
  const isRev = is_reverse !== undefined ? (is_reverse === true || is_reverse === "true") : null;

  let updatedFeat = null;
  try {
    const query = `
      UPDATE why_choose_features
      SET feature_number = COALESCE($1, feature_number),
          title = COALESCE($2, title),
          subtitle = COALESCE($3, subtitle),
          description = COALESCE($4, description),
          image = COALESCE($5, image),
          icon_name = COALESCE($6, icon_name),
          is_reverse = COALESCE($7, is_reverse),
          display_order = COALESCE($8, display_order)
      WHERE id::text = $9
      RETURNING *;
    `;
    const result = await database.query(query, [
      feature_number !== undefined ? feature_number : null,
      title !== undefined ? title : null,
      subtitle !== undefined ? subtitle : null,
      description !== undefined ? description : null,
      imageUrl !== undefined ? imageUrl : null,
      icon_name !== undefined ? icon_name : null,
      isRev,
      orderNum,
      id,
    ]);
    if (result && result.rows && result.rows.length > 0) {
      updatedFeat = result.rows[0];
    }
  } catch (error) {
    console.warn("Database error on why choose update:", error.message);
  }

  const idx = fallbackWhyChoose.findIndex((f) => f.id === id);
  if (idx !== -1) {
    fallbackWhyChoose[idx] = {
      ...fallbackWhyChoose[idx],
      ...(feature_number !== undefined && { feature_number }),
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(description !== undefined && { description }),
      ...(imageUrl !== undefined && { image: imageUrl }),
      ...(icon_name !== undefined && { icon_name }),
      ...(isRev !== null && { is_reverse: isRev }),
      ...(orderNum !== null && { display_order: orderNum }),
    };
    if (!updatedFeat) updatedFeat = fallbackWhyChoose[idx];
  }

  if (!updatedFeat) {
    updatedFeat = { id, feature_number, title, subtitle, description, image: imageUrl };
  }

  res.status(200).json({
    success: true,
    message: "Why Choose feature updated successfully.",
    feature: updatedFeat,
  });
});

/* =====================================================================
   5. ANNOUNCEMENT BAR CONTROLLER (Top Header Message)
===================================================================== */
let fallbackAnnouncement = "Haute Formulation & Complimentary Concierge Delivery on Orders Above $75 CAD";

export const getAnnouncement = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await database.query(`SELECT value FROM site_settings WHERE key = 'announcement_bar';`);
    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        announcement: result.rows[0].value,
      });
    }
  } catch (error) {
    console.warn("Database query failed for announcement, using fallback:", error.message);
  }

  res.status(200).json({
    success: true,
    announcement: fallbackAnnouncement,
  });
});

export const updateAnnouncement = catchAsyncErrors(async (req, res, next) => {
  const { announcement } = req.body;
  if (!announcement || !announcement.trim()) {
    return next(new ErrorHandler("Announcement text is required.", 400));
  }

  fallbackAnnouncement = announcement.trim();

  try {
    await database.query(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ('announcement_bar', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP;`,
      [announcement.trim()]
    );
  } catch (error) {
    console.warn("Database query failed for announcement update:", error.message);
  }

  res.status(200).json({
    success: true,
    message: "Announcement updated successfully.",
    announcement: fallbackAnnouncement,
  });
});

/* =====================================================================
   6. NAVIGATION MENU CONTROLLER (Header & Mobile Drawer Navigation)
===================================================================== */
let fallbackMenuItems = [
  { id: "nav-1", name: "Shop All", path: "/products", badge: "", is_active: true, display_order: 1 },
  { id: "nav-2", name: "Best Sellers", path: "/products?filter=best-sellers", badge: "Popular", is_active: true, display_order: 2 },
  { id: "nav-3", name: "About Us", path: "/about", badge: "", is_active: true, display_order: 3 },
  { id: "nav-4", name: "Contact", path: "/contact", badge: "", is_active: true, display_order: 4 },
  { id: "nav-5", name: "FAQ", path: "/faq", badge: "", is_active: true, display_order: 5 },
];

export const getMenuItems = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await database.query(
      `SELECT * FROM navigation_menu ORDER BY display_order ASC, created_at ASC;`
    );
    if (result && result.rows && result.rows.length > 0) {
      return res.status(200).json({
        success: true,
        menu: result.rows,
      });
    }
  } catch (error) {
    console.warn("Database query failed for navigation_menu, using fallback:", error.message);
  }

  res.status(200).json({
    success: true,
    menu: fallbackMenuItems,
  });
});

export const createMenuItem = catchAsyncErrors(async (req, res, next) => {
  const { name, path, badge, display_order, is_active } = req.body;
  if (!name || !name.trim()) {
    return next(new ErrorHandler("Menu item name is required.", 400));
  }
  if (!path || !path.trim()) {
    return next(new ErrorHandler("Menu item path/link is required.", 400));
  }

  const id = `nav-${Date.now()}`;
  const orderNum = display_order !== undefined && display_order !== "" ? parseInt(display_order, 10) : fallbackMenuItems.length + 1;
  const activeStatus = is_active !== undefined ? (is_active === true || is_active === "true") : true;
  const badgeText = badge ? badge.trim() : "";

  let newItem = {
    id,
    name: name.trim(),
    path: path.trim(),
    badge: badgeText,
    is_active: activeStatus,
    display_order: orderNum,
  };

  try {
    const result = await database.query(
      `INSERT INTO navigation_menu (id, name, path, badge, is_active, display_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *;`,
      [id, newItem.name, newItem.path, newItem.badge, newItem.is_active, newItem.display_order]
    );
    if (result && result.rows && result.rows.length > 0) {
      newItem = result.rows[0];
    }
  } catch (error) {
    console.warn("Database error creating navigation menu item, saving to fallback:", error.message);
  }

  fallbackMenuItems.push(newItem);
  fallbackMenuItems.sort((a, b) => a.display_order - b.display_order);

  res.status(201).json({
    success: true,
    message: "Menu item created successfully.",
    item: newItem,
  });
});

export const updateMenuItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { name, path, badge, display_order, is_active } = req.body;

  const orderNum = display_order !== undefined && display_order !== "" ? parseInt(display_order, 10) : null;
  const activeStatus = is_active !== undefined ? (is_active === true || is_active === "true") : null;

  let updatedItem = null;
  try {
    const query = `
      UPDATE navigation_menu
      SET name = COALESCE($1, name),
          path = COALESCE($2, path),
          badge = COALESCE($3, badge),
          is_active = COALESCE($4, is_active),
          display_order = COALESCE($5, display_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id::text = $6
      RETURNING *;
    `;
    const result = await database.query(query, [
      name !== undefined ? name.trim() : null,
      path !== undefined ? path.trim() : null,
      badge !== undefined ? badge.trim() : null,
      activeStatus,
      orderNum,
      id,
    ]);
    if (result && result.rows && result.rows.length > 0) {
      updatedItem = result.rows[0];
    }
  } catch (error) {
    console.warn("Database error on navigation menu update:", error.message);
  }

  const idx = fallbackMenuItems.findIndex((item) => item.id === id);
  if (idx !== -1) {
    fallbackMenuItems[idx] = {
      ...fallbackMenuItems[idx],
      ...(name !== undefined && { name: name.trim() }),
      ...(path !== undefined && { path: path.trim() }),
      ...(badge !== undefined && { badge: badge.trim() }),
      ...(activeStatus !== null && { is_active: activeStatus }),
      ...(orderNum !== null && { display_order: orderNum }),
    };
    if (!updatedItem) updatedItem = fallbackMenuItems[idx];
  }

  if (!updatedItem) {
    updatedItem = { id, name, path, badge, is_active: activeStatus, display_order: orderNum };
  }

  fallbackMenuItems.sort((a, b) => a.display_order - b.display_order);

  res.status(200).json({
    success: true,
    message: "Menu item updated successfully.",
    item: updatedItem,
  });
});

export const deleteMenuItem = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  try {
    await database.query(`DELETE FROM navigation_menu WHERE id::text = $1;`, [id]);
  } catch (error) {
    console.warn("Database error on navigation menu delete:", error.message);
  }

  fallbackMenuItems = fallbackMenuItems.filter((item) => item.id !== id);

  res.status(200).json({
    success: true,
    message: "Menu item deleted successfully.",
  });
});

/* =====================================================================
   7. BACKGROUND THEME & SKY CLOUDS CONTROLLER
===================================================================== */
let fallbackBackgroundSettings = {
  theme: "sky-day", // "sky-day", "sky-sunset", "custom"
  enableClouds: true,
  cloudSpeed: "normal", // "slow", "normal", "fast"
  cloudDensity: "high", // "low", "medium", "high"
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

export const getBackgroundSettings = catchAsyncErrors(async (req, res, next) => {
  try {
    const result = await database.query(`SELECT value FROM site_settings WHERE key = 'site_background';`);
    if (result && result.rows && result.rows.length > 0) {
      const parsed = JSON.parse(result.rows[0].value);
      return res.status(200).json({
        success: true,
        background: { ...fallbackBackgroundSettings, ...parsed },
      });
    }
  } catch (error) {
    console.warn("Database query failed for background settings, using fallback:", error.message);
  }

  res.status(200).json({
    success: true,
    background: fallbackBackgroundSettings,
  });
});

export const updateBackgroundSettings = catchAsyncErrors(async (req, res, next) => {
  const settings = req.body;
  if (!settings || typeof settings !== "object") {
    return next(new ErrorHandler("Invalid background settings provided.", 400));
  }

  const merged = { ...fallbackBackgroundSettings, ...settings };
  fallbackBackgroundSettings = merged;

  try {
    await database.query(
      `INSERT INTO site_settings (key, value, updated_at) VALUES ('site_background', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = CURRENT_TIMESTAMP;`,
      [JSON.stringify(merged)]
    );
  } catch (error) {
    console.warn("Database error saving background settings:", error.message);
  }

  res.status(200).json({
    success: true,
    message: "Background settings updated successfully.",
    background: merged,
  });
});



