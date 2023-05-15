import express, { Request, Response, NextFunction, response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import { getSM, Service } from '../serviceManager';
import axios from 'axios';


export const proxy = async (req: any, res: Response, next: NextFunction) => {
    const user = req.user;
    const serviceManager = getSM();
    let serviceName = req.params.serviceName;
    let service = serviceManager.findByName(serviceName);
    if (service === undefined) {
        res.status(404).json({
            "error": `No service with name: ${serviceName} found!`
        })
    }

    const user_id = req.user._id.toString();
    if (service) {
        if (service.name === "FeathrTalk") {
            if (req.headers['upgrade'] === 'websocket') {
                console.log('here')
                const proxyOptions = createProxyOptions(service, user_id);
                await createProxyMiddleware(proxyOptions)(req, res, next)
                next()
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
                axios.request(options).then(function (response) {
                    res.send(response.data)
                }).catch(function (error) {
                    res.send(error)
                });
            }
        }

    } else {
        res.status(404).send("Service does not exist!")
    }
}


function createProxyOptions(service: Service, id: String) {
    // const hasChat = (url: string) => url.includes('chat');
    // const appendIdToChatUrl = (url: string) => {
    //     console.log(url)
    //     let newUrl = url.replace('/chat', `/chat/${id}`)
    //     console.log(newUrl)
    //     return newUrl
    // };
    return {
        target: service.endpoint, // service endpoint as described in config.json
        changeOrigin: true, // set to true, endpoint only accepts from this origin
        logger: 'debug', // Useful for development
        ws: true, // needed to setup websocket connection
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