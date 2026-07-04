import Main from "./src/MainExpress"

await Main.getMe().run();

// function isValidInput(theInput) {
//     const regex = /^[0-9\-_]+$/;
//     return regex.test(theInput);
// }

// function extractUserId(barcode) {
//     if (isValidInput(barcode)) {
//         let arr = barcode.split("_");
//         if (arr.length == 7) {
//             try {
//                 const firstPart = arr[0]
//                 const len = (~(parseInt(arr[1], 10) & 0xFF) & 0xFF);
//                 const secondPart = arr[2];
//                 const id1 = parseInt(arr[3], 10);
//                 const id2 = parseInt(arr[4], 10);
//                 const id3 = parseInt(arr[5], 10);
//                 const rest = arr[6];
//                 if (secondPart.length == 5) {
//                     const startChar = secondPart[1];
//                     const endChar = secondPart[3];
//                     const rawNum = firstPart + secondPart[0] + secondPart[2] + secondPart[4] + rest;
//                     const hash = parseInt(rawNum, 10);
//                     const z = hash / 2;
//                     if (Number.isInteger(z)) {
//                         const y = (z - id3) / 3;
//                         if (Number.isInteger(y)) {
//                             const x = (y - id2) / 2;
//                             if (Number.isInteger(x)) {
//                                 const userId = x - id1;
//                                 const userIdStr = userId + "";
//                                 if (userIdStr.length == len && userIdStr[0] == startChar && userIdStr[userIdStr.length - 1] == endChar) {
                                    
//                                     return userId;
//                                 }
//                             }
//                         }
//                     }
//                 } 
//             } catch (e) {
//                 console.log(e);
//             } 
//         } 
//     }
//     return -1;
// }

// console.log(extractUserId("8_-9_16262_79_68_66_41600"));

