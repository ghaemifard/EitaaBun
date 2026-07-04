import ProfileController from "./ProfileController";
import MyRoute from "./MyRoutes";


class ProfleRoutes extends MyRoute{
    protected init(){
        this.router.post("/change", this.wrapAsync( ProfileController.changeProfile));
        this.router.post("/changePicture", this.wrapAsync( ProfileController.changeProfilePicture));
        this.router.post("/getSessions", this.wrapAsync( ProfileController.getSessions));
        this.router.post("/restrictPrivacy", this.wrapAsync( ProfileController.changePrivacyToLimitAddGroup));
        this.router.post("/setUsername", this.wrapAsync( ProfileController.setUsername));
        this.router.post("/checkUsername", this.wrapAsync( ProfileController.checkUsername));
        this.router.post("/getPictureInfo", this.wrapAsync( ProfileController.getPicInfo));
        this.router.post("/getPicture", this.wrapAsync( ProfileController.getPic)); 



        this.router.post("/startUpdates", this.wrapAsync( ProfileController.startGettingUpdates));
        this.router.post("/stopUpdates", this.wrapAsync( ProfileController.stopGettingUpdates));
        
       
        //this.router.post("/sendCode", this.wrapAsync( AuthController.sendCode));   
    }
}
export default new ProfleRoutes().router;
