import ContactController from "./ContactController";
import MyRoute from "./MyRoutes";

class ContactRoutes extends MyRoute{
     protected init(): void {
        this.router.post("/add", this.wrapAsync( ContactController.addContact));
        this.router.post("/delete", this.wrapAsync( ContactController.deleteContact));
        this.router.get("/getAll/:phone", this.wrapAsync( ContactController.getContacts)); 
        //this.router.post("/sendCode", this.wrapAsync( AuthController.sendCode)); 
    }
}

export default new ContactRoutes().router