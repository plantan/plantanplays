import Papa from 'papaparse';
import Bun from 'bun';

const games = Bun.file("games-finished.csv");
const text = await games.text();
const id = process.argv.slice(2)[0];
const secret = process.argv.slice(2)[1];

const response = await fetch(new Request(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method: "POST", }));
const jsonResponse = await response.json();
const access_token = jsonResponse["access_token"];

Papa.parse(text, { header: true, complete(csv) {
    const igdbids = new Array<string>();
    for (const row of csv.data) {
        const igdbid = row["IGDBID"];
        if (igdbid != undefined && igdbid.length > 0) {
            igdbids.push(igdbid);
        }
    }

    const map = new Map<string, string>();
    Promise.all(igdbids.map(async (igdbid) => {
        const igdb_req = new Request("https://api.igdb.com/v4/covers", {
            method: "POST",
            body: `fields image_id; where game = ${igdbid};`,
            headers: {
                "Accept": "application/json",
                "Client-ID": id,
                "Authorization": `Bearer ${access_token}`
            },
        });
        
        await Bun.sleep(250); // IGDB rate limit is 4 requests per second
        const res = await fetch(igdb_req);
        const json = await res.json();
        if (json.length > 0) {
            map.set(igdbid, `https://images.igdb.com/igdb/image/upload/t_cover_big/${json[0].image_id}.jpg`);
        }
    })).then(() => {
        const writer = Bun.file("game-covers.json").writer();
        writer.write(JSON.stringify(Object.fromEntries(map)));
        writer.end()
    });
}});
