import express from "express";
import { getKite } from "../config/kite.config.js";

const profileRouter = express.Router();

profileRouter.get("/profile", async (req, res) => {
  try {
    const kc = getKite();
    const profile = await kc.getProfile();
    res.json(profile);
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

export default profileRouter;
