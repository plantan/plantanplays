import Papa from 'papaparse';

const games = Bun.file("games-finished.csv");
const text = await games.text();
const apiKey = process.argv.slice(2)[0];

Papa.parse(text, { header: true, complete(csv) {
    const rawgids = new Array<string>();
    for (const row of csv.data) {
        const rawgid = row["RAWGID"];
        if(rawgid != undefined && rawgid.length > 0) {
            rawgids.push(rawgid);
        }
    }
    
    const map = new Map<string, string>();
    Promise.all(rawgids.map(async (rawgid) => {
        const res = await fetch(`https://api.rawg.io/api/games/${rawgid}?key=${apiKey}`);
        const json = await res.json();
        map.set(rawgid, json.background_image);
    })).then(() => {
        const writer = Bun.file("game-covers.json").writer();
        writer.write(JSON.stringify(Object.fromEntries(map)));
        writer.end()
    });
}});
