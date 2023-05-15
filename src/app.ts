// Import required modules
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { initDb } from './mongoDb';
import { getSM, initSM, Service } from './serviceManager';
import { proxy } from './middleware/proxy';
import { AuthRouter } from './routes';
import { initEnv } from './env';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authenticateJWT } from './middleware/jwt';

// Load environment variables
dotenv.config({ path: '.env' })

// Create Express app
const app = express();

// Middleware for parsing request bodies
app.use(bodyParser.json());

//Init .env variables
initEnv()

//Init Services
initSM()

// Routes: 
// Define middleware for proxying requests to Rust backend
app.use("/auth", AuthRouter)
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
app.use('/api/:serviceName/*', authenticateJWT, proxy);
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
    return res.status(200).json({})
})

// Start the Express app on a specified port
initDb(function () {
    const port = 3000;
    app.listen(port, () => {
        console.log(`API Gateway listening on http://localhost:${port}`);
    });
})
