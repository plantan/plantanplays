import Papa from 'papaparse';
import Bun from 'bun';

const games = Bun.file("games-finished.csv");
const text = await games.text();
const id = process.argv.slice(2)[0];
const secret = process.argv.slice(2)[1];

const response = await fetch(new Request(`https://id.twitch.tv/oauth2/token?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`, { method: "POST", }));
const jsonResponse = await response.json();
const access_token = jsonResponse["access_token"];

Papa.parse(text, { header: true, complete: papaparse_complete });
async function papaparse_complete(csv: any) {
    const igdbids = new Array<string>();
    for (const row of csv.data) {
        const igdbid = row["IGDBID"];
        if (igdbid != undefined && igdbid.length > 0) {
            igdbids.push(igdbid);
        }
    }

    const map = new Map<string, { cover_url: string, cover_big_url: string, date: Date }>();
    for (const igdbid of igdbids) {
        const req_cover = build_igdb_req("https://api.igdb.com/v4/covers", `fields image_id; where game = ${igdbid};`);
        const req_date = build_igdb_req("https://api.igdb.com/v4/games", `fields first_release_date; where id = ${igdbid};`);
        const res = await Promise.all([fetch(req_cover), fetch(req_date), Bun.sleep(500)]);
        const json = await Promise.all([res[0].json(), res[1].json()]);

        const cover = json[0][0].image_id;
        const date = new Date(json[1][0].first_release_date * 1000);
        map.set(igdbid, {
            cover_url: `https://images.igdb.com/igdb/image/upload/t_cover_big/${cover}.jpg`,
            cover_big_url: `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${cover}.jpg`,
            date: date
        });
    }

    const writer = Bun.file("igdb.json").writer();
    writer.write(JSON.stringify(Object.fromEntries(map)));
    writer.end();
}

function build_igdb_req(endpoint: string, body: string): Request {
    return new Request(endpoint, {
        method: "POST",
        body: body,
        headers: {
            "Accept": "application/json",
            "Client-ID": id,
            "Authorization": `Bearer ${access_token}`
        },
    });
}