import BaseController from "../system/base.controller.js";
import PastebinRepo from "../repositories/pastebinRepo.js";

export default class AganithaPasteBin extends BaseController {
  constructor() {
    super();
    this.pastebinRepo = new PastebinRepo();
  }

  // IST ISO string without milliseconds
  getISTISOString() {
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    return new Date(Date.now() + istOffsetMs)
      .toISOString()
      .split(".")[0];
  }

  checkExpiry(currentDate, expiryDate) {
    if (!expiryDate) return false;
    return new Date(currentDate) > new Date(expiryDate);
  }

  async decrementView(pasteId) {
    await this.pastebinRepo.findOneAndUpdate(
      { pasteId, remaining_views: { $gt: 0 } },
      { $inc: { remaining_views: -1 } }
    );
  }

  async healthCheck(req, res) {
    res.json({ ok: true });
  }

  async createPaste(req, res) {
    try {
      const { pasteContent, ttl_seconds, max_views } = req.body;

      if (!pasteContent) {
        return res.status(400).json({ error: "Paste content is empty" });
      }

      const pasteId =
        Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      const payload = {
        pasteId,
        pasteContent,
        CreatedAt: this.getISTISOString(),
        ttlFlag: true,
        maxViewFlag: true,
      };

      /* ---------- TTL handling ---------- */
      if (ttl_seconds !== "" && ttl_seconds !== undefined) {
        const ttlSeconds = Number(ttl_seconds);

        if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
          return res.status(400).json({ error: "Invalid ttl_seconds" });
        }

        const expiryEpochMs = (Date.now() + ttlSeconds * 1000) + (5.5 * 60 * 60 * 1000);
        payload.expires_at = new Date(expiryEpochMs)
          .toISOString()
          .split(".")[0];

        payload.ttlFlag = false;
      }

      /* ---------- Max views handling ---------- */
      if (max_views !== "" && max_views !== undefined) {
        const maxViews = Number(max_views);

        if (!Number.isInteger(maxViews) || maxViews <= 0) {
          return res.status(400).json({ error: "Invalid max_views" });
        }

        payload.remaining_views = maxViews;
        payload.maxViewFlag = false;
      }

      payload.pasteBinUrl = `${req.protocol}://${req.get("host")}/p/${pasteId}`;

      await this.pastebinRepo.insertNewObject(payload);

      return res.status(200).json({
        id: pasteId,
        url: payload.pasteBinUrl,
      });
    } catch (error) {
      console.error("Error in createPaste:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async fetchPaste(req, res) {
    try {
      const paste = await this.pastebinRepo.findOne({
        pasteId: req.params.pasteId,
      });

      if (!paste) {
        return res.status(404).json({ error: "Paste not found" });
      }

      const currentDate =
        process.env.TEST_MODE == 1
          ? new Date(Number(req.headers["x-test-now-ms"]))
          : new Date(this.getISTISOString());

      if (!paste.ttlFlag && this.checkExpiry(currentDate, paste.expires_at)) {
        return res.status(404).json({ error: "Paste expired" });
      }

      if (!paste.maxViewFlag) {
        if (paste.remaining_views <= 0) {
          return res.status(404).json({ error: "Paste expired" });
        }
        await this.decrementView(paste.pasteId);
      }

      return res.status(200).json({
        pasteContent: paste.pasteContent,
        remaining_views: paste.remaining_views,
        expires_at: paste.expires_at,
      });
    } catch (error) {
      console.error("Error in fetchPaste:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async viewPaste(req, res) {
    try {
      const paste = await this.pastebinRepo.findOne({
        pasteId: req.params.pasteId,
      });

      if (!paste) {
        return res.status(404).send("Paste not found");
      }

      const currentDate =
        process.env.TEST_MODE == 1
          ? new Date(Number(req.headers["x-test-now-ms"]))
          : new Date(this.getISTISOString());

      if (!paste.ttlFlag && this.checkExpiry(currentDate, paste.expires_at)) {
        return res.status(404).send("Paste expired");
      }

      if (!paste.maxViewFlag) {
        if (paste.remaining_views <= 0) {
          return res.status(404).send("Paste expired");
        }
        await this.decrementView(paste.pasteId);
      }

      return res.status(200).send(paste.pasteContent);
    } catch (error) {
      console.error("Error in viewPaste:", error);
      return res.status(500).send("Internal server error");
    }
  }
}
