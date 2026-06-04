// API con base de datos. Usa el driver oficial `pg` para consultar Postgres.
const http = require("http");
const { Pool } = require("pg");

const PORT = process.env.PORT || 3000;

// El pool se conecta usando DATABASE_URL (la inyecta docker-compose.yml).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Tabla de rutas pura (sin tocar la BD): fácil de probar en unit tests.
function matchRoute(method, pathname) {
  if (method === "GET" && pathname === "/health") return "health";
  if (method === "GET" && pathname === "/") return "root";
  if (method === "GET" && pathname === "/tareas") return "listTareas";
  if (method === "POST" && pathname === "/tareas") return "createTarea";
  return "notFound";
}

function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

async function handler(req, res) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const route = matchRoute(req.method, pathname);

  if (route === "root") {
    return send(res, 200, { mensaje: "API con base de datos", version: "2.0" });
  }

  if (route === "health") {
    try {
      await pool.query("SELECT 1");
      return send(res, 200, { status: "ok", db: true });
    } catch {
      return send(res, 200, { status: "ok", db: false });
    }
  }

  if (route === "listTareas") {
    try {
      const { rows } = await pool.query(
        "SELECT id, titulo, hecha, creada FROM tareas ORDER BY id"
      );
      return send(res, 200, rows);
    } catch (e) {
      return send(res, 503, { error: "base de datos no disponible" });
    }
  }

  if (route === "createTarea") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", async () => {
      try {
        const { titulo } = JSON.parse(body || "{}");
        if (!titulo) return send(res, 400, { error: "falta 'titulo'" });
        const { rows } = await pool.query(
          "INSERT INTO tareas (titulo) VALUES ($1) RETURNING id, titulo, hecha, creada",
          [titulo]
        );
        return send(res, 201, rows[0]);
      } catch (e) {
        return send(res, 503, { error: "base de datos no disponible" });
      }
    });
    return;
  }

  return send(res, 404, { error: "no encontrado" });
}

const server = http.createServer(handler);

if (require.main === module) {
  server.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
}

module.exports = { matchRoute };
