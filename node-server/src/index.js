const express = require("express");
const path = require('path');
const bodyParser = require("body-parser");
const routes = require("./routes");
const session = require("express-session");
const redis = require("redis");
const RedisStore = require("connect-redis").default;

const startServer = async () => {
    try {
        console.log('Connecting to Redis at', process.env.REDIS_HOST, process.env.REDIS_PORT);
        // Configure Redis client
        const redisClient = redis.createClient({
            socket: {
                host: process.env.REDIS_HOST || "localhost",
                port: process.env.REDIS_PORT || 6379,
            }
        });
        await redisClient.connect();

        const app = express();
        app.use(bodyParser.json());
        app.use(
            session({
                store: new RedisStore({ client: redisClient }),
                secret: "drive-search",
                resave: false,
                saveUninitialized: true,
                cookie: { secure: false }, // set to true if using HTTPS
            })
        );

        // Serve Angular static files
        app.use(express.static(path.join(__dirname, 'public')));

        app.use("/api", routes);

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
      console.log(e);
    }
};

startServer();
