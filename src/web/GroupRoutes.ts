import GroupController from "./GroupController";
import MyRoute from "./MyRoutes";

class GroupRoutes extends MyRoute{
    protected init(){
        this.router.post("/create", this.wrapAsync( GroupController.createGroup));
        this.router.post("/changePicture", this.wrapAsync( GroupController.changeGroupPicture));
        this.router.post("/change", this.wrapAsync( GroupController.changeGroup));
        this.router.post("/addMember", this.wrapAsync( GroupController.addToGroup));
        this.router.post("/leave", this.wrapAsync( GroupController.leaveGroup));
        this.router.post("/addAdmin", this.wrapAsync( GroupController.addAdminToGroup));
        this.router.post("/editAdmin", this.wrapAsync( GroupController.addAdminToGroup));
        this.router.post("/changePermissions", this.wrapAsync( GroupController.changeGroupPermission));
        this.router.post("/changeMemberPermissions", this.wrapAsync( GroupController.changeGroupMemberPermission));
        this.router.post("/getMembers", this.wrapAsync( GroupController.viewGroupMembers));
        this.router.post("/getAdmins", this.wrapAsync( GroupController.viewGroupAdmins));
        this.router.post("/delete", this.wrapAsync( GroupController.deleteGroup));
        this.router.post("/deleteMember", this.wrapAsync( GroupController.deleteMemberFromGroup));
        this.router.post("/getLink", this.wrapAsync( GroupController.getJoinLink));
        // this.router.post("/getDetails", this.wrapAsync( GroupController.getChannelDetails));
        // this.router.post("/deleteMember", this.wrapAsync( GroupController.deleteMemberFromGroup));
        
        //this.router.post("/sendCode", this.wrapAsync( AuthController.sendCode));   
    }
}
export default new GroupRoutes().router;