"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxy = void 0;
const http_proxy_middleware_1 = require("http-proxy-middleware");
const serviceManager_1 = require("../serviceManager");
const axios_1 = __importDefault(require("axios"));
const proxy = async (req, res, next) => {
    const user = req.user;
    const serviceManager = (0, serviceManager_1.getSM)();
    let serviceName = req.params.serviceName;
    let service = serviceManager.findByName(serviceName);
    if (service === undefined) {
        res.status(404).json({
            "error": `No service with name: ${serviceName} found!`
        });
    }
    const user_id = req.user._id.toString();
    if (service) {
        if (service.name === "FeathrTalk") {
            if (req.headers['upgrade'] === 'websocket') {
                console.log('here');
                const proxyOptions = createProxyOptions(service, user_id);
                await (0, http_proxy_middleware_1.createProxyMiddleware)(proxyOptions)(req, res, next);
                next();
            }
            else {
                let new_url = req.baseUrl.split(`/api/${service.name}/`)[1];
                var options = {
                    method: req.method,
                    url: `${service.endpoint}${new_url}`,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: req.body
                };
                axios_1.default.request(options).then(function (response) {
                    res.send(response.data);
                }).catch(function (error) {
                    res.send(error);
                });
            }
        }
    }
    else {
        res.status(404).send("Service does not exist!");
    }
};
exports.proxy = proxy;
function createProxyOptions(service, id) {
    // const hasChat = (url: string) => url.includes('chat');
    // const appendIdToChatUrl = (url: string) => {
    //     console.log(url)
    //     let newUrl = url.replace('/chat', `/chat/${id}`)
    //     console.log(newUrl)
    //     return newUrl
    // };
    return {
        target: service.endpoint,
        changeOrigin: true,
        logger: 'debug',
        ws: true,
        pathRewrite: {
            [`^/api/${service.name}`]: '',
        },
        // onProxyReq: (proxyReq: any, req: any, res: any) => {
        //     if (hasChat(req.url)) {
        //         // console.log(proxyReq)
        //         proxyReq.path = appendIdToChatUrl(proxyReq.path);
        //     }
        // },
    };
}
