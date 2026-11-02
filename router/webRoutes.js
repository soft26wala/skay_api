import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  getSanctumSpaces,
  createSanctumSpace,
  updateSanctumSpace,
  deleteSanctumSpace,
  getWhyChooseFeatures,
  createWhyChooseFeature,
  updateWhyChooseFeature,
  deleteWhyChooseFeature,
  getAnnouncement,
  updateAnnouncement,
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getBackgroundSettings,
  updateBackgroundSettings,
} from "../controllers/webContentController.js";

const router = express.Router();

// 1. Categories Routes
router.get("/categories", getCategories);
router.post("/categories", createCategory);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);

// 2. Hero Slides Routes (Can add 3+ images)
router.get("/hero", getHeroSlides);
router.post("/hero", createHeroSlide);
router.put("/hero/:id", updateHeroSlide);
router.delete("/hero/:id", deleteHeroSlide);

// 3. Sanctum Spaces Routes ("Inside Our Wellness Sanctum")
router.get("/sanctum", getSanctumSpaces);
router.post("/sanctum", createSanctumSpace);
router.put("/sanctum/:id", updateSanctumSpace);
router.delete("/sanctum/:id", deleteSanctumSpace);

// 4. Why Choose Features Routes ("Why Choose Skay Products")
router.get("/why-choose", getWhyChooseFeatures);
router.post("/why-choose", createWhyChooseFeature);
router.put("/why-choose/:id", updateWhyChooseFeature);
router.delete("/why-choose/:id", deleteWhyChooseFeature);

// 5. Top Announcement Bar Routes
router.get("/announcement", getAnnouncement);
router.post("/announcement", updateAnnouncement);
router.put("/announcement", updateAnnouncement);

// 6. Navigation Menu Routes (Header & Mobile Drawer)
router.get("/menu", getMenuItems);
router.post("/menu", createMenuItem);
router.put("/menu/:id", updateMenuItem);
router.delete("/menu/:id", deleteMenuItem);

// 7. Background Theme & Sky Clouds Animation Routes
router.get("/background", getBackgroundSettings);
router.post("/background", updateBackgroundSettings);
router.put("/background", updateBackgroundSettings);

export default router;

