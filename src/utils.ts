
export enum PeerType{
    USER,
    CHANNEL,
    CHAT
}

export const savePath = (process.env.HOME || process.env.USERPROFILE) + "/eitaSessions/";

export function extractFiveDigits(input: string): string | null {
    const match = input.match(/\d{5}/);
    return match ? match[0] : null;
}

export function  generateOneDigit(){
    let res= Math.floor(Math.random()*10);
    res = res == 10 ? res-1 : res;
    return res;
}
export function  generateWebImei(){
    const small_letters = "abcdefghijlkmnopqrstuvwxyzabcdefghijlkmnopqrstuvwxyz";
    let result = '';
    for(var i=0;i<8;i++){
        result += small_letters[Math.floor(Math.random()*(small_letters.length-1))];
    }
    for(var i=0;i<3;i++){
        result +=  generateOneDigit();
    }
    result += small_letters[Math.floor(Math.random()*(small_letters.length-1))] +
    small_letters[Math.floor(Math.random()*(small_letters.length-1))];

    result +=  generateOneDigit();;
    result += small_letters[Math.floor(Math.random()*(small_letters.length-1))];
    result += "__web";
    return result;
}

function merger(first:Uint8Array,second:Uint8Array){
    const res = new  Uint8Array(first.length+second.length);
    res.set(first);
    res.set(second,first.length);
    return res;
}
 
export async function genPassword(pass:string,salt:Uint8Array,padZero=true){
    if(padZero){
        const endPadding = new Uint8Array([0,0,0,0 ,0,0,0,0]);
    const new_salt = merger(salt,endPadding);
    const encoder = new TextEncoder();
    const passArray = encoder.encode(pass);

    const hashBuffer = await crypto.subtle.digest('SHA-256', merger(merger(new_salt,passArray),new_salt));
    return hashBuffer;
    } else{ 
        const new_salt = salt;
        const encoder = new TextEncoder();
        const passArray = encoder.encode(pass);
    
        const hashBuffer = await crypto.subtle.digest('SHA-256', merger(merger(new_salt,passArray),new_salt));
        return hashBuffer;
    }
    
    
     
}
 
