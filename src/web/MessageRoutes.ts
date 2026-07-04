import MessageController from "./MessageController";
import MyRoute from "./MyRoutes";


class ProfleRoutes extends MyRoute{
    protected init(){
        this.router.post("/send", this.wrapAsync( MessageController.sendMessage));
        this.router.post("/sendMedia", this.wrapAsync( MessageController.sendMedia));
        this.router.post("/forward", this.wrapAsync( MessageController.forwardMessage));
        this.router.post("/delete", this.wrapAsync( MessageController.deleteMessage));
        this.router.post("/edit", this.wrapAsync( MessageController.editMessage));
        this.router.post("/pin", this.wrapAsync( MessageController.pinMessage));
        this.router.post("/read", this.wrapAsync( MessageController.readMessage));
        this.router.post("/mark", this.wrapAsync( MessageController.markMessageAsRead));
        this.router.post("/dialogs", this.wrapAsync( MessageController.getDialogs));
        this.router.post("/getFile", this.wrapAsync( MessageController.getFile));
        

        //this.router.post("/sendCode", this.wrapAsync( AuthController.sendCode));   
    }
}
export default new ProfleRoutes().router;
