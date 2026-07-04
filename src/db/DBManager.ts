import { Database } from "bun:sqlite";


export interface SessionRecord{
    id:number,
    imei:string,
    token:string
}

export default class BunDBManager{
    private static manager = new BunDBManager();
    private db = new Database("db.sqlite");
    private dbCreated = false;
    public static getMe(){
        return this.manager;
    }

    


    private constructor(){}

    public createTables(){
        if(this.dbCreated) return;
        this.db.exec("PRAGMA journal_mode = WAL;");
        this.db.run(`
                    CREATE TABLE IF NOT EXISTS sessions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        imei TEXT NOT NULL,
                        token TEXT NOT NULL
                    )
                    `);
        this.db.run(`
                    CREATE TABLE IF NOT EXISTS contacts (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        userId INTEGER,
                        status INTEGER
                    )
                    `);
        
        this.dbCreated = true;
    }

    public updateContact(id:number,userId:number,status:number){
        using q = this.db.prepare("UPDATE contacts SET userId = ?,status=?  WHERE id = ?");
        q.run(userId,status,id);
        // console.log(`session for ${id} updated`);
    }
    public getAllContacts(){
        using q = this.db.prepare("SELECT * FROM contacts");
        return q.all();
    }
    public chunckOfContacts(from:number,to:number){
        using q = this.db.prepare("SELECT * FROM contacts where id>=? and id < ?");
        return q.all(from,to);
         
    }
    public getContactById(id:number){
        using q = this.db.prepare("SELECT * FROM contacts where id=?");
        const rec = q.get(id);
        return rec;
    }
    public seedContacts(from:number,to:number){
        for(let i=from;i<to;i++){
            using q = this.db.prepare("INSERT INTO contacts (id) VALUES (?) ");
            q.run(i);
        }
    }

    public dropTable(table:string){
        this.db.run(`DROP TABLE ${table}`);
    }

    public insertSession(imei:string,token:string){
        using q = this.db.prepare("INSERT INTO sessions (imei,token) VALUES (?,?) ");
        q.run(imei,token);
        console.log("Token inserted")
    }

    public getAllSessions(){
        using q = this.db.prepare("SELECT * FROM sessions");
        const sessions = q.all();
        return sessions;
    }

    public getSessionById(id:number){
        using q = this.db.prepare("SELECT * FROM sessions where id=?");
        const rec = q.get(id);
        return rec;
    }

    public updateSessoinById(id:number,token:string){
        using q = this.db.prepare("UPDATE sessions SET token = ? WHERE id = ?");
        q.run(token,id);
        console.log(`session for ${id} updated`);

    }





}