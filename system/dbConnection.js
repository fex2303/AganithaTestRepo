import mongoose from "mongoose"

export default class dbConnection{
    constructor() {
        this.options = { keepAlive: 1, connectTimeoutMS: 30000, useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true };

        this.createMongoConnection()
    }


    createMongoConnection(){

        const db = mongoose.connection;
        const reconnectTimeout = Number(process.env.DB_RECONNECT_TIMEOUT || 5000);

        db.on("connecting", () => {
            console.log("Connecting to MongoDB...");
        });

        db.on("connected", async () => {
            console.log("Connected to MongoDB");

            try {
                const info = await db.db.admin().buildInfo();
                console.log("MongoDB version:", info?.version || "_");
            } catch {
                console.log("Unable to fetch MongoDB version");
            }
        });

        db.on("error", (err) => {
            console.error("MongoDB error:", err.message);
        });

        db.on("disconnected", () => {
            console.log(
                `MongoDB disconnected. Reconnecting in ${reconnectTimeout / 1000}s...`
            );
            setTimeout(() => this.connect(), reconnectTimeout);
        });

        this.connect();
    }

    async connect() {
        try {
            await mongoose.connect(process.env.DB_URL, {
                connectTimeoutMS: 30000
            });
        } catch (err) {
            console.error("MongoDB connection failed:", err.message);
        }
    }
}