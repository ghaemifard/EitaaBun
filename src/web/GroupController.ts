import type { Request, Response } from 'express';
import Caller from '../MTCaller';
import { generateWebImei, savePath } from '../utils';
import Controller from './Controller';
import SessionManager from './SessionManager';

class GroupController extends Controller {
    public createGroup = async (req: Request, resp: Response) => {
        const { phone, title, ids } = req.body;
        if (!this.hasValue(title)) {
            this.sendError(resp, "the title field is not specified");
            return;
        }
        if (!this.hasValue(ids)) {
            this.sendError(resp, "the ids field, which is an array of userId, is not specified");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in createGroup")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            let createChannel = async () => await caller.createGroup(title, ids);
            let _res = await this.callMethod(createChannel, resp, phone, caller);
            if (_res && _res._ && _res._ == "updates") {
                if (_res.chats && _res.chats.length > 0) {
                    const groupId = _res.chats[0].id;
                    const migrate = async () => await caller.migrateChat(groupId);
                    _res = await this.callMethod(migrate, resp, phone, caller);
                    if (_res && _res._ && _res._ == "updates") {
                        if (_res.chats && _res.chats.length > 1) {
                            const chat0 = _res.chats[0];
                            const chat1 = _res.chats[1];

                            if (chat0 && chat1 && chat0._ && chat1._) {
                                if (chat0._ == "chat") {
                                    resp.send({
                                        groupId: chat0.id,
                                        channelId: chat1.id,
                                        access_hash: chat1.access_hash
                                    });
                                } else {
                                    resp.send({
                                        groupId: chat1.id,
                                        channelId: chat0.id,
                                        access_hash: chat0.access_hash
                                    });
                                }

                            } else {
                                this.sendError(resp, "every thing is ok except chats in migrate");
                                // console.log(_res);
                            }

                        } else {
                            this.sendError(resp, "Method is Ok but the chats field is empty (for migrate)");
                        }
                    } else {
                        this.sendError(resp, "the body of craeteChannel has Problems (for migrate):\n" + JSON.stringify(_res));
                    }

                } else {
                    this.sendError(resp, "Method is Ok but the chats field is empty");
                }
            } else {
                this.sendError(resp, "Body of craeteChannel has Problems:\n" + JSON.stringify(_res));
            }
        }
    }

    // public createGroup = async (req: Request, resp: Response) => {
    //     const { phone, title, about } = req.body;
    //     if (!this.hasValue(title)) {
    //         this.sendError(resp, "the title field is not specified");
    //         return;
    //     }

    //     if (this.checkPhone(resp, phone, "Session does not exist in createGroup")) {
    //         const caller: Caller = SessionManager.getMe().get(phone);
    //         let createChannel = async () => await caller.createChannel(title, about, true);
    //         let _res = await this.callMethod(createChannel, resp, phone, caller);
    //         if (_res && _res._ && _res._ == "updates") {
    //             if (_res.chats && _res.chats.length > 0) {
    //                 resp.send({
    //                     groupId: _res.chats[0].id
    //                 })
    //             } else {
    //                 this.sendError(resp, "Method is Ok but the chats field is empty");
    //             }
    //         } else {
    //             this.sendError(resp, "Body of craeteChannel has Problems:\n" + _res);
    //         }
    //     }
    // }

    public changeGroupPicture = async (req: Request, resp: Response) => {
        const { phone, path, id } = req.body;
        if (!this.hasValue(path)) {
            this.sendError(resp, "there must be a path field in changeGroupPicture");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "there must be an id field in changeGroupPicture");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in changeGroupPicture")) {
            const caller: Caller = SessionManager.getMe().get(phone);

            const uploadFile = async () => await caller.uploadFile(path, null);
            const file = await this.callMethod(uploadFile, resp, phone, caller);
            if (file) {
                const editPhoto = async () => await caller.editChannelPhoto(id, file);
                const _res = await this.callMethod(editPhoto, resp, phone, caller);
                if (_res && _res._ && _res._ == "updates") {
                    resp.send({
                        result: "ok"
                    });
                }
            } else {
                this.sendError(resp, "cannot upload file");
            }
        }
    }

    public changeGroup = async (req: Request, resp: Response) => {
        const { phone, id, title, description } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field");
            return;
        }
        let isChange = false;
        if (title) {
            isChange = true;
            if (this.checkPhone(resp, phone, "Session does not exist in changeGroupTitle")) {
                const caller: Caller = SessionManager.getMe().get(phone);

                const changeTitle = async () => await caller.editChannelTitle(id, title);
                const _res = await this.callMethod(changeTitle, resp, phone, caller);
                if (_res && _res._ && _res._ == "updates" && _res.chats && _res.chats.length > 0) {
                    
                    if(!description){
                        resp.send({
                        result: "ok"
                    })
                }
                } else {
                    this.sendError(resp, "the body of changeGroupTitle is empty")
                    return;
                }
            }else{
                return;
            }
        }
        if(description){
            isChange = true;
            if (this.checkPhone(resp, phone, "Session does not exist in changeGroupDesc ")) {
                const caller: Caller = SessionManager.getMe().get(phone);

                const changeTitle = async () => await caller.editChatAbout(id, description);
                const _res = await this.callMethod(changeTitle, resp, phone, caller);
                if (_res && _res._ && _res._ == "boolTrue" ) {
                    resp.send({
                        result: "ok"
                    })
                } else {
                    this.sendError(resp, "the body of changeGroupDesc  is empty");
                }
            }else{
                return;
            }
        } 

        if(!isChange){
            this.sendError(resp,"title or description field must be specified");
        }
    }


    // public changeGroupTitle = async (req: Request, resp: Response) => {
    //     const { phone, id, title } = req.body;
    //     if (!this.hasValue(id)) {
    //         this.sendError(resp, "You must fill the id field");
    //         return;
    //     }
    //     if (!this.hasValue(title)) {
    //         this.sendError(resp, "you must fill the title field");
    //         return;
    //     }

    //     if (this.checkPhone(resp, phone, "Session does not exist in changeGroupTitle")) {
    //         const caller: Caller = SessionManager.getMe().get(phone);

    //         const changeTitle = async () => await caller.editChannelTitle(id, title);
    //         const _res = await this.callMethod(changeTitle, resp, phone, caller);
    //         if (_res && _res._ && _res._ == "updates" && _res.chats && _res.chats.length > 0) {
    //             resp.send({
    //                 result: "ok"
    //             })
    //         } else {
    //             this.sendError(resp, "the body of changeGroupTitle is empty")
    //         }
    //     }
    // }



    public leaveGroup = async (req: Request, resp: Response) => {
        const { phone, id } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in leaveGroup")) {
            const caller: Caller = SessionManager.getMe().get(phone);

            const leave = async () => await caller.leaveChannel(id);
            const _res = await this.callMethod(leave, resp, phone, caller);
            console.log(_res);
            if (_res && _res._ && _res._ == "updates" && _res.chats && _res.chats.length > 0) {
                resp.send({
                    result: "ok"
                })
            } else if (_res && _res.text && _res.text == "CHANNEL_INVALID") {
                this.sendError(resp, `Channel does not exist: ${id}`)
            } else {
                this.sendError(resp, "the body of leaveGroup is empty")
            }
        }
    }
    public addToGroup = async (req: Request, resp: Response) => {
        const { phone, id, uid, access_hash } = req.body;

        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field");
            return;
        }
        if (!this.hasValue(uid)) {
            this.sendError(resp, "You must fill the uid field which is the user id");
            return;
        }
        if (!this.hasValue(access_hash)) {
            this.sendError(resp, "You must fill the access_hash field which is the user access_hash");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in addToGroup")) {
            const caller: Caller = SessionManager.getMe().get(phone);

            const invite = async () => await caller.inviteToChannel(id, "0", [[uid, access_hash]]);
            const _res = await this.callMethod(invite, resp, phone, caller);

            if (_res && _res._) {
                if (_res.text && _res.text == "USER_NOT_MUTUAL_CONTACT") {
                    this.sendError(resp, "not allowed by the user");
                    return;
                } else if (_res._ == "updates" && _res.chats && _res.chats.length > 0) {
                    resp.send({
                        success: "ok"
                    })
                } else {
                    this.sendError(resp, "error\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "body is empty in addToGroup")
            }
        }
    }
    public addAdminToGroup = async (req: Request, resp: Response) => {
        let { phone, id, uid, access_hash, canChangeInfo,
            canInviteUsers, canDeleteMesssages, canBanUsers,
            canAddAdmins, canPinMessages, canSendLives
        } = req.body;
        if (!this.hasValue(access_hash)) {
            this.sendError(resp, "You must fill the access_hash field which is the user access_hash");
            return;
        }
        if (!this.hasValue(uid)) {
            this.sendError(resp, "You must fill the uid field which is the user id");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }
        // console.log(`canChangeInfo=${canChangeInfo} canInviteUsers=${canInviteUsers} canDeleteMesssages=${canDeleteMesssages} canBanUsers=${canBanUsers} canSendLives=${canSendLives} canPinMessages=${canPinMessages} canAddAdmins=${canAddAdmins} `);
        if (canAddAdmins == null) {
            canAddAdmins = false;
        }
        if (canPinMessages == null) {
            canPinMessages = true
        }
        if (canSendLives == null) {
            canSendLives = true;
        }
        if (canBanUsers == null) {
            canBanUsers = true;
        }
        if (canDeleteMesssages == null) {
            canDeleteMesssages = true;
        }
        if (canInviteUsers == null) {
            canInviteUsers = true;
        }
        if (canChangeInfo == null) {
            canChangeInfo = true;
        }
        // console.log(`canChangeInfo=${canChangeInfo} canInviteUsers=${canInviteUsers} canDeleteMesssages=${canDeleteMesssages} canBanUsers=${canBanUsers} canSendLives=${canSendLives} canPinMessages=${canPinMessages} canAddAdmins=${canAddAdmins} `);
        // console.log("--------------------------")
        if (this.checkPhone(resp, phone, "Session does not exist in add_edit_AdminGroup")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const addAdmin = async () => await caller.editAdmin(id, uid, access_hash, canChangeInfo, canBanUsers, canDeleteMesssages, canInviteUsers, canPinMessages, canAddAdmins, canSendLives);

            const _res = await this.callMethod(addAdmin, resp, phone, caller);
            if (_res && _res._ && _res._ == "updates" && _res.chats && _res.chats.length > 0) {
                resp.send({
                    result: "ok"
                });
            } else {
                this.sendError(resp, "the body of AddEditAdmin is empty");
            }
        }


    }

    // Test From here
    public changeGroupPermission = async (req: Request, resp: Response) => {
        let { phone, id, canSendMessages,
            canSendMedia, canSendGifs, canForwardMessages,
            canSendLinks, canViewMembers, canAddMembers
        } = req.body;


        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }

        if (canSendMessages == null) {
            canSendMessages = true;
        }
        if (canSendMedia == null) {
            canSendMedia = true;
        }
        if (canForwardMessages == null) {
            canForwardMessages = true;
        }
        if (canAddMembers == null) {
            canAddMembers = false;
        }
        if (canViewMembers == null) {
            canViewMembers = false;
        }
        if (canSendGifs == null) {
            canSendGifs = true;
        }
        if (canSendLinks == null) {
            canSendLinks = true;
        }

        console.log(`canForwardMessages: '${canForwardMessages}'`)
        if (this.checkPhone(resp, phone, "Session does not exist in changeGroupPermission")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const editBanned = async () => await caller.editDefaultBanned(id, canSendMessages, canSendMedia, canSendGifs,canForwardMessages, canSendLinks, canViewMembers, canAddMembers);
            const _res = await this.callMethod(editBanned, resp, phone, caller);
            if (_res && _res._) {
                if (_res._ == "updates") {
                    resp.send({
                        result: "ok"
                    });
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of changeGroupPermission is empty");
            }
        }

    }
    public changeGroupMemberPermission = async (req: Request, resp: Response) => {
        let { phone, id, uid, access_hash, canSendMessages,
            canSendMedia, canSendGifs, canForwardMessages,
            canSendLinks, canViewMembers, canAddMembers
        } = req.body;

        if (!this.hasValue(access_hash)) {
            this.sendError(resp, "You must fill the access_hash field which is the user access_hash");
            return;
        }
        if (!this.hasValue(uid)) {
            this.sendError(resp, "You must fill the uid field which is the user id");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }

        if (canSendMessages == null) {
            canSendMessages = true;
        }
        if (canSendMedia == null) {
            canSendMedia = true;
        }
        if (canForwardMessages == null) {
            canForwardMessages = true;
        }
        if (canAddMembers == null) {
            canAddMembers = false;
        }
        if (canViewMembers == null) {
            canViewMembers = false;
        }
        if (canSendGifs == null) {
            canSendGifs = true;
        }
        if (canSendLinks == null) {
            canSendLinks = true;
        }


        if (this.checkPhone(resp, phone, "Session does not exist in changeGroupMemberPermission")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const editBanned = async () => await caller.editBanned(id, uid, access_hash, canSendMessages, canSendMedia, canSendGifs, canForwardMessages, canSendLinks, canViewMembers, canAddMembers);
            const _res = await this.callMethod(editBanned, resp, phone, caller);
            if (_res && _res._) {
                if (_res._ == "updates") {
                    resp.send({
                        result: "ok"
                    });
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of changeGroupMemberPermission is empty");
            }
        }
    }

    private async viewGroupMembers_(req: Request, resp: Response, isAdmin = false) {
        let { phone, id, start, size
        } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }
        if (!start) {
            start = 0;
        }
        if (!size) {
            size = 200;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in viewGroupMembers_")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const viewMems = async () => await caller.getChannelParticipants(id, 0, isAdmin, start, size);
            const _res = await this.callMethod(viewMems, resp, phone, caller);
            if (_res && _res._) {
                // console.log(_res);
                if (_res._ == "channels.channelParticipants") {
                    if (_res.users) {
                        let ls = [];
                        for (let i = 0; i < _res.users.length; i++) {
                            ls.push({
                                id: _res.users[i].id,
                                access_hash: _res.users[i].access_hash,
                                firstname: _res.users[i].first_name,
                                last_name: _res.users[i].last_name,
                                username: _res.users[i].username,
                                status: _res.users[i].status._
                            });
                        }
                        resp.send({
                            participants: ls
                        });

                    } else {
                        this.sendError(resp, "there's no member in this group")
                    }
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of viewGroupMembers_ is empty");
            }
        }
    }
    public viewGroupMembers = async (req: Request, resp: Response) => {
        await this.viewGroupMembers_(req, resp);

    }
    public viewGroupAdmins = async (req: Request, resp: Response) => {
        await this.viewGroupMembers_(req, resp, true);
    }

     

    public deleteGroup = async (req: Request, resp: Response) => {
        let { phone, id
        } = req.body; 

        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }
        if (this.checkPhone(resp, phone, "Session does not exist in deleteGroup")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const deleteIt = async()=> await caller.deleteChannel(id);
            const _res = await this.callMethod(deleteIt,resp,phone,caller);
            if (_res && _res._) { 
                if (_res._ == "updates") {
                    resp.send({
                        result: "ok"
                    });
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of deleteGroup is empty");
            }

        }

    }
    public deleteMemberFromGroup = async (req: Request, resp: Response) => {
        let { phone, id, uid, access_hash
        } = req.body;

        if (!this.hasValue(access_hash)) {
            this.sendError(resp, "You must fill the access_hash field which is the user access_hash");
            return;
        }
        if (!this.hasValue(uid)) {
            this.sendError(resp, "You must fill the uid field which is the user id");
            return;
        }
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }
 
          
        if (this.checkPhone(resp, phone, "Session does not exist in deleteMemberFromGroup")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const editBanned = async () => await caller.editBanned(id, uid, access_hash, false, false, false, false, false, false, false, true);
            const _res = await this.callMethod(editBanned, resp, phone, caller);
            if (_res && _res._) {
                if (_res._ == "updates") {
                    resp.send({
                        result: "ok"
                    });
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of deleteMemberFromGroup is empty");
            }
        }


    }
    public getJoinLink = async (req: Request, resp: Response) => {
        let { phone, id,
        } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in getJoinLink")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const fullChannel = async () => await caller.getFullChannel(id);
            const _res = await this.callMethod(fullChannel, resp, phone, caller);
            if (_res && _res._) {
                if (_res._ == "messages.chatFull") {
                    if (_res.full_chat && _res.full_chat.exported_invite && _res.full_chat.exported_invite.link) {

                        resp.send({
                            link: _res.full_chat.exported_invite.link
                        });

                    } else {
                        this.sendError(resp, "NoLink")
                    }
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of getJoinLink is empty");
            }

        } 
    }

    public getChannelDetails = async (req: Request, resp: Response) => {
        let { phone, id,
        } = req.body;
        if (!this.hasValue(id)) {
            this.sendError(resp, "You must fill the id field which is the group id");
            return;
        }

        if (this.checkPhone(resp, phone, "Session does not exist in getJoinLink")) {
            const caller: Caller = SessionManager.getMe().get(phone);
            const fullChannel = async () => await caller.getFullChannel(id);
            const _res = await this.callMethod(fullChannel, resp, phone, caller);
            if (_res && _res._) {
                if (_res._ == "messages.chatFull") {
                    if (_res.full_chat && _res.full_chat.exported_invite && _res.full_chat.exported_invite.link) {

                        resp.send({
                            link: _res.full_chat.exported_invite.link
                        });

                    } else {
                        this.sendError(resp, "NoLink")
                    }
                } else if (_res._ == "error") {
                    this.sendError(resp, _res.text);
                } else {
                    this.sendError(resp, "Unknown problem:\n" + JSON.stringify(_res));
                }
            } else {
                this.sendError(resp, "the body of getJoinLink is empty" );
            }

        } 
    }

    

    // public getJoinLink = async (req: Request, resp: Response) => {
    //     let { phone, id , start, size
    //     } = req.body; 
    // }









}
export default new GroupController();