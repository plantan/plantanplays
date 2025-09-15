import Papa from 'papaparse';
import Bun from 'bun';

const games = Bun.file("games-finished.csv");
const text = await games.text();
const id = process.argv.slice(2)[0];
const secret = process.argv.slice(2)[1];

console.log(id);
console.log(secret);

const response = await fetch(new Request(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method: "POST", }));
const jsonResponse = await response.json();
console.log(jsonResponse["access_token"]);
console.log(jsonResponse["expires_in"]);
console.log(jsonResponse["token_type"]);


//   "access_token": "access12345token",
//   "expires_in": 5587808,
//   "token_type": "bearer"

// Papa.parse(text, { header: true, complete(csv) {
//     const rawgids = new Array<string>();
//     for (const row of csv.data) {
//         const rawgid = row["RAWGID"];
//         if(rawgid != undefined && rawgid.length > 0) {
//             rawgids.push(rawgid);
//         }
//     }
    
//     const map = new Map<string, string>();
//     Promise.all(rawgids.map(async (rawgid) => {
//         const res = await fetch(`https://api.rawg.io/api/games/${rawgid}?key=${apiKey}`);
//         const json = await res.json();
//         console.log(json)
//         map.set(rawgid, json.background_image);
//     })).then(() => {
//         const writer = Bun.file("game-covers.json").writer();
//         writer.write(JSON.stringify(Object.fromEntries(map)));
//         writer.end()
//     });
// }});
