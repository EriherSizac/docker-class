# Laboratorio de Implantación — Variante con Base de Datos

Igual que el lab base (Docker → Docker Compose → GitHub Actions → CloudFormation),
pero la API **sí usa la base de datos**: hay una tabla `tareas` que se **siembra
automáticamente** con `db/init.sql`, y endpoints que la consultan.

El objetivo es ver cómo se le cargan las tablas y los datos a un Postgres que
corre dentro de un contenedor.

## Qué cambia respecto al lab base

- `db/init.sql` — esquema (`CREATE TABLE tareas`) + datos semilla (`INSERT`).
- `docker-compose.yml` — monta ese script en el servicio `db`.
- `src/server.js` — ahora usa el driver `pg` y expone:
  - `GET /health` — verifica la conexión a la BD (`db: true/false`).
  - `GET /tareas` — devuelve las filas de la tabla.
  - `POST /tareas` — inserta una tarea (`{ "titulo": "..." }`).
- `package.json` — agrega la dependencia `pg`.

## Cómo se cargan las tablas (lo importante)

La imagen oficial de Postgres ejecuta **automáticamente** cualquier `.sql` o `.sh`
que esté en `/docker-entrypoint-initdb.d/`, pero **solo la primera vez**, cuando el
volumen de datos (`pgdata`) está vacío. En `docker-compose.yml` montamos el script ahí:

```yaml
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
```

Por eso, al levantar el stack con el volumen limpio, la tabla `tareas` ya viene
creada y con datos. La base es **real y persistente**: los datos sobreviven a
reinicios y a `docker compose down`. Solo se borran con `down --volumes`.

> Otras dos formas de cargar el esquema (no usadas aquí):
> **manual** entrando con `psql`, o **migraciones** (Flyway, node-pg-migrate, Prisma)
> que es lo más cercano a producción.

## Práctica principal · Compose con base de datos

```bash
# 1) Descomprime el repo y entra
cd itc-implantacion-lab-db

# 2) Levanta el stack (api + db + nginx). init.sql siembra la tabla.
docker compose up -d --build

# 3) Verifica que la API ve la base
curl http://localhost:8080/health        # -> {"status":"ok","db":true}

# 4) Consulta las tareas sembradas por init.sql
curl http://localhost:8080/tareas

# 5) Inserta una tarea nueva (escritura real a la base)
curl -X POST http://localhost:8080/tareas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Mi primera tarea"}'

# 6) Vuelve a consultar: ahora aparece la nueva fila
curl http://localhost:8080/tareas

# Re-sembrar desde cero (borra el volumen y vuelve a correr init.sql)
docker compose down --volumes && docker compose up -d
```

### Inspeccionar la base directamente (opcional)

```bash
docker compose exec db psql -U app -d app -c "SELECT * FROM tareas;"
docker compose exec db psql -U app -d app    # sesión interactiva: \dt, \d tareas, ...
```

**Entregable:** `curl /tareas` mostrando las filas sembradas + la fila que insertaste con POST.

## Las otras prácticas

Docker (`Dockerfile`), GitHub Actions (`.github/workflows/`) y CloudFormation
(`infra/template.yml`) funcionan igual que en el lab base; consulta ese README
para los pasos. La diferencia es que aquí la imagen incluye la dependencia `pg`
y la app consulta la base.

## Correr sin Docker (opcional)

```bash
npm install
npm test                 # 5 pruebas del router (no necesitan BD)
# Para /tareas necesitas un Postgres con DATABASE_URL apuntando a él.
```
