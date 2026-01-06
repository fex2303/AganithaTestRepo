import mongoose from "mongoose";

const aganithaPasteBinSchema = new mongoose.Schema(
    {
        createdTimeEpoch: { type: Number },
        pasteContent: { type: String },
        ttl_seconds: { type: String },
        max_views: { type: String },
        current_view_count: { type: String },
    },
    { strict: false }
);

export default mongoose.model("aganithaPasteBin", aganithaPasteBinSchema);