const http = require("http"),
  fs = require("fs"),
  path = require("path");
const base = path.resolve(process.argv[2] || "dist");
http
  .createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = path.resolve(base, "." + rel);
    if (!file.startsWith(base + path.sep) && file !== base) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory())
      file = path.join(file, "index.html");
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404).end();
        return;
      }
      res.setHeader(
        "Content-Type",
        file.endsWith(".html")
          ? "text/html; charset=utf-8"
          : file.endsWith(".svg")
            ? "image/svg+xml"
            : file.endsWith(".js")
              ? "text/javascript"
              : file.endsWith(".css")
                ? "text/css"
                : "text/plain",
      );
      res.end(data);
    });
  })
  .listen(Number(process.argv[3] || 4173), "127.0.0.1", () =>
    console.log("http://127.0.0.1:" + (process.argv[3] || 4173)),
  );
