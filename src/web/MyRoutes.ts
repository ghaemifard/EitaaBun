
import { Router } from 'express';
import type { Request, Response } from 'express';

export default abstract class MyRoute{
    public router: Router;
    public constructor(){
        this.router = Router();
        this.init();
    }
    protected abstract init(): void;
    
    protected wrapAsync(fn: Function) {
        return function (req: Request, res: Response, next: Function) {
          fn(req, res, next).catch(next);
        };
      } 
}