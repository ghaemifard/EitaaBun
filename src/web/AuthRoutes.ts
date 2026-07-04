import { Router } from 'express';
import AuthController from "./AuthController"
import MyRoute from './MyRoutes';

class AuthRoutes extends MyRoute{
    
  protected init(){
    this.router.post("/sendCode", this.wrapAsync( AuthController.sendCode));
    this.router.post("/login", this.wrapAsync( AuthController.login));
    this.router.post("/logout",this.wrapAsync(AuthController.logout));
    this.router.post("/loadSession",this.wrapAsync(AuthController.loadSession));
    this.router.post("/makeTwoSteps",this.wrapAsync(AuthController.enforceTwoStepVerification));
    this.router.post("/loginByPass",this.wrapAsync(AuthController.loginWithPassword));
  } 
}

export default new AuthRoutes().router;