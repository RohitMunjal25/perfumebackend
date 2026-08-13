const express = require("express");
const WatchBuy = require("../models/WatchBuy");
const DiscoveryPack = require("../models/DiscoveryPack");
const InstagramFeed = require("../models/InstagramFeed");
const { auth, admin } = require("../middleware/auth");

const router = express.Router();

router.get("/watch-and-buy", async (_req, res) => {
  try {
    const records = await WatchBuy.find({ isActive: true }).populate("productId").sort({ createdAt: -1 });
    res.json({ success: true, items: records.map((item) => ({ _id: item._id, title: item.productId?.name, thumbnailLink: item.thumbnailUrl || item.coverImageUrl, videoLink: item.videoUrl, product: item.productId })) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post("/watch-and-buy", auth, admin, async (req, res) => {
  try { const item = await WatchBuy.create({ thumbnailUrl: req.body.thumbnailLink || req.body.thumbnailUrl, coverImageUrl: req.body.thumbnailLink || req.body.coverImageUrl || "", videoUrl: req.body.videoLink || req.body.videoUrl, productId: req.body.productId, isActive: req.body.isActive !== false }); res.status(201).json({ success: true, item }); } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});
router.patch("/watch-and-buy/:id", auth, admin, async (req, res) => { try { const item = await WatchBuy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!item) return res.status(404).json({ success:false, message:"Watch item not found" }); res.json({ success:true, item }); } catch (error) { res.status(400).json({ success:false, message:error.message }); } });
router.delete("/watch-and-buy/:id", auth, admin, async (req, res) => { await WatchBuy.findByIdAndDelete(req.params.id); res.json({ success:true }); });

router.get("/instagram", async (_req, res) => { try { res.json({ success:true, posts: await InstagramFeed.find({ isActive:true }).sort({ createdAt:-1 }) }); } catch (error) { res.status(500).json({ success:false, message:error.message }); } });
router.post("/instagram", auth, admin, async (req, res) => { try { const post = await InstagramFeed.create({ coverImageUrl:req.body.coverImageUrl, videoUrl:req.body.videoUrl || "", instaLink:req.body.instaLink, isActive:req.body.isActive !== false }); res.status(201).json({ success:true, post }); } catch (error) { res.status(400).json({ success:false, message:error.message }); } });
router.delete("/instagram/:id", auth, admin, async (req, res) => { await InstagramFeed.findByIdAndDelete(req.params.id); res.json({ success:true }); });

router.get("/discovery-packs", async (_req, res) => { try { res.json({ success:true, packs: await DiscoveryPack.find({ isActive:true }).sort({ createdAt:-1 }) }); } catch (error) { res.status(500).json({ success:false, message:error.message }); } });
router.post("/discovery-packs", auth, admin, async (req, res) => { try { const pack = await DiscoveryPack.create(req.body); res.status(201).json({ success:true, pack }); } catch (error) { res.status(400).json({ success:false, message:error.message }); } });
router.patch("/discovery-packs/:id", auth, admin, async (req, res) => { try { const pack = await DiscoveryPack.findByIdAndUpdate(req.params.id, req.body, { new:true, runValidators:true }); if (!pack) return res.status(404).json({ success:false, message:"Discovery pack not found" }); res.json({ success:true, pack }); } catch (error) { res.status(400).json({ success:false, message:error.message }); } });
router.delete("/discovery-packs/:id", auth, admin, async (req, res) => { await DiscoveryPack.findByIdAndDelete(req.params.id); res.json({ success:true }); });

module.exports = router;
