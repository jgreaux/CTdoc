import { serveDir } from "https://deno.land/std@0.203.0/http/file_server.ts";
import { parse } from "./utils/indexfolder.ts";
import { init, reinit, close, getIndex } from "./utils/db.ts";

const dataRoot = "/data"

let index = await parse(dataRoot);
init(index)

addEventListener("unload", close);

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/api/index" && req.method === "GET") {
    return new Response(JSON.stringify(getIndex()), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (url.pathname === "/api/reindex" && req.method === "GET") {
    index = await parse(dataRoot)
    reinit(index)
    return new Response(null, {
      status: 302, // or 301 for permanent
      headers: {
        Location: "/",
      },
    });
  }

  if (url.pathname.startsWith("/doc/") && req.method === "GET") {
    const filePath = decodeURIComponent(dataRoot + url.pathname.substring(4))
    try {
      const data = await Deno.readFile(filePath);
      const headers = new Headers();
      headers.set("Content-Type",  "application/pdf");
      headers.set("Cache-Control",  "public, max-age=300");

      return new Response(data, { status: 200, headers });
    } catch (err) {
      return new Response(err, { status: 404 });
    }
  }

  return serveDir(req, {fsRoot: "./static",});
});