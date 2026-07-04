import type Caller from "../MTCaller";

export default class SessionManager{
    private static instance_ = new SessionManager();
    private map_ = new Map();
    private constructor(){}
    public static getMe(){
        return this.instance_;
    }

    public contains(key:string){
        return this.map_.has(key);
    }
    public push(key:string, value:Caller){
        this.map_.set(key,value);
    }
    public get(key:string){
        return this.map_.get(key);
    }

}