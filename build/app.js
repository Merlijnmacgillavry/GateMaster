"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import required modules
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoDbService_1 = require("./mongoDbService");
const serviceManager_1 = require("./serviceManager");
const proxy_1 = require("./middleware/proxy");
const routes_1 = require("./routes");
const env_1 = require("./env");
const jwt_1 = require("./middleware/jwt");
// Load environment variables
dotenv_1.default.config({ path: '.env' });
// Create Express app
const app = (0, express_1.default)();
// Middleware for parsing request bodies
app.use(body_parser_1.default.json());
//Init .env variables
(0, env_1.initEnv)();
//Init Services
(0, serviceManager_1.initSM)();
// Routes: 
// Define middleware for proxying requests to Rust backend
app.use("/auth", routes_1.AuthRouter);
// const proxyMiddleware = createProxyMiddleware({
//     target: 'http://localhost:8080/',
//     changeOrigin: false,
//     pathRewrite: (path, req) => {
//         const serviceManager = getSM();
//         const [, api, serviceName, ...rest] = req.path.split('/');
//         console.log(serviceName)
//         let service = serviceManager.findByName(serviceName);
//         // modify the target based on the :servicename parameter
//         const target = `${service?.endpoint}`;
//         // modify the path by removing the :servicename parameter and any leading slashes
//         const newPath = `${rest.join('/')}`;
//         console.log(newPath)
//         console.log(target);
//         return newPath;
//     },
// });
// app.use('/api/', proxyMiddleware);
// Use the middleware in your Express app
app.use('/api/:serviceName/*', jwt_1.authenticateJWT, proxy_1.proxy);
// app.use('/api/FeathrTalk', authenticateJWT, createProxyMiddleware({
//     target: "http://localhost:8080/", // service endpoint as described in config.json
//     changeOrigin: false, // set to true, endpoint only accepts from this origin
//     ws: true, // needed to setup websocket connection
//     pathRewrite: {
//         [`^/api/FeathrTalk`]: '',
//     },
// })); 
// Route for logging in and getting access token and refresh token
app.get('/health_check', async (req, res) => {
    return res.status(200).json({});
});
// Start the Express app on a specified port
(0, mongoDbService_1.initDb)(function () {
    const port = 3000;
    app.listen(port, () => {
        console.log(`API Gateway listening on http://localhost:${port}`);
    });
});
