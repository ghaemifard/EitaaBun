import { TLDeserialization, TLSerialization } from "./tl_utils.js";
import fetch from "node-fetch";


 

export async function request(tlsBody, isUpload= false ,isVector = false) {
    //const body = wrapRequest(packedData);
    if(isUpload){

        return sendRequestUpload(tlsBody, isVector);;
    }
    return sendRequest(tlsBody, isVector);

}
export async function requestD(tlsBody, isUpload= false ,isVector = false) {
    //const body = wrapRequest(packedData);
   
    return sendRequestDownload(tlsBody, isVector);;
    

}

export function templateBody(name,params,isMT= false){
    const tls_ = new TLSerialization({ mtproto: isMT })
    // console.log("name: " + name + " params: " + params)
    tls_.storeMethod(name,params);
    return tls_;

}
 

async function sendRequest(body, isVector = false) {
    // const servers_dc=[ "https://hasan.eitaa.ir/eitaa/", "https://hosna.eitaa.com/eitaa/", "https://armita.eitaa.com/eitaa/", "https://majid.eitaa.com/eitaa/", "https://alireza.eitaa.com/eitaa/", "https://mostafa.eitaa.com/eitaa/", "https://sajad.eitaa.ir/eitaa/", "https://bagher.eitaa.ir/eitaa/", "https://sadegh.eitaa.ir/eitaa/", "https://kazem.eitaa.ir/eitaa/","https://hasan.eitaa.ir/eitaa/", "https://hosna.eitaa.com/eitaa/", "https://armita.eitaa.com/eitaa/", "https://majid.eitaa.com/eitaa/", "https://alireza.eitaa.com/eitaa/", "https://mostafa.eitaa.com/eitaa/", "https://sajad.eitaa.ir/eitaa/", "https://bagher.eitaa.ir/eitaa/", "https://sadegh.eitaa.ir/eitaa/", "https://kazem.eitaa.ir/eitaa/"];
   const servers_dc=[ "https://bagher.eitaa.ir/eitaa/" ];

    
//    const response = await fetch(servers_dc[Math.floor(Math.random() * servers_dc.length)], {
//     method: 'POST', body: body.getBytes(true)
    
// });

 
const response = await fetch("https://bagher.eitaa.ir/eitaa/", {
    method: 'POST', body: body.getBytes(true)
    
});
   return parseResponse(new Uint8Array(await response.arrayBuffer()), isVector ? 'Vector' : '');
}



async function sendRequestUpload(body, isVector = false) {
    //const servers_dc= ["https://alzheimer.eitaa.com/eitaa/", "https://fateme.eitaa.com/eitaa/", "https://ali.eitaa.com/eitaa/", "https://meysam.eitaa.com/eitaa/"];
   const servers_dc=[ "https://ali.eitaa.com/eitaa/" ];

   
   const response = await fetch(servers_dc[Math.floor(Math.random() * servers_dc.length)], {
       method: 'POST', body: body.getBytes(true)
       
       
   });
   return parseResponse(new Uint8Array(await response.arrayBuffer()), isVector ? 'Vector' : '');
}

async function sendRequestDownload(body, isVector = false) {
    //const servers_dc= ["https://alzheimer.eitaa.com/eitaa/", "https://fateme.eitaa.com/eitaa/", "https://ali.eitaa.com/eitaa/", "https://meysam.eitaa.com/eitaa/"];
   const servers_dc=[ "https://hadi.eitaa.com/eitaa/" ];

   
   const response = await fetch(servers_dc[Math.floor(Math.random() * servers_dc.length)], {
       method: 'POST', body: body.getBytes(true)
       
       
   });
   return parseResponse(new Uint8Array(await response.arrayBuffer()), isVector ? 'Vector' : '');
}





export function parseResponse(response, type = "") {
    const deserializer = new TLDeserialization(new Uint8Array(response), { mtproto: true })
    const eitaaObject = deserializer.fetchObject(type, "INPUT");
    if (eitaaObject.packed_data) {
        const packedDeserializer = new TLDeserialization(new Uint8Array(eitaaObject.packed_data), { mtproto: true })
        return packedDeserializer.fetchObject("", "INPUT");
    }
    return eitaaObject;
}
