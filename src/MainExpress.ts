import express from 'express';
import authRoutes from "./web/AuthRoutes"
import groupRoutes from "./web/GroupRoutes"
import contactRoutes from "./web/ContactRoutes"
import profileRoutes from "./web/ProfileRoutes"
import messageRoutes from "./web/MessageRoutes"
import { savePath } from './utils';
import * as fs from 'fs';

export default class Main {
    private args = require('args-parser')(process.argv);
    private static instance_: Main = new Main();
    // private caller = new Caller();
    private constructor() { }

    public static getMe() {
        return this.instance_;
    }
    async run() {

        if(!fs.existsSync(savePath)){
            fs.mkdirSync(savePath);
        }
        
        const app = express();
        const port = 1234;


        app.use(express.json());
        app.use('/eitaa/auth', authRoutes);
        app.use('/eitaa/groups', groupRoutes);
        app.use('/eitaa/contacts', contactRoutes);
        app.use('/eitaa/messages', messageRoutes);
        app.use('/eitaa/profile', profileRoutes);
        

        app.get('/', (req, res) => {
            res.send('Eitaa Manager');
        });


        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });


    }





}