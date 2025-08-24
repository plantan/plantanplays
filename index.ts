import Bun from "bun";
import homepage from "./index.html";

const server = Bun.serve({
    port: 3000,
    hostname: "172.22.23.103",
    routes: { "/": homepage },

    fetch: async (req) => {
        const url = new URL(req.url);
        if (url.pathname == "/games-finished.csv") {
            return new Response(Bun.file("./games-finished.csv"), {
                headers: { "Content-Type": "text/csv" }
            });
        } else if (url.pathname == "/game-covers.json") {
            return new Response(Bun.file("./game-covers.json"), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // 404 for everything else
        return new Response("Not found", { status: 404 });
    }
});

console.log(`Listening on http://${server.hostname}:${server.port} ...`);
