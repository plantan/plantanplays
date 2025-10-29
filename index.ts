import Bun from "bun";
import homepage from "./index.html";

const server = Bun.serve({
    port: 80,
    hostname: "0.0.0.0",
    routes: { "/": homepage },

    fetch: async (req) => {
        const url = new URL(req.url);
        if (url.pathname == "/games-finished.csv") {
            return new Response(Bun.file("./games-finished.csv"), {
                headers: { "Content-Type": "text/csv" }
            });
        } else if (url.pathname == "/igdb.json") {
            return new Response(Bun.file("./igdb.json"), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 404 for everything else
        return new Response("Not found", { status: 404 });
    }
});

console.log(`Listening on http://${server.hostname}:${server.port} ...`);
