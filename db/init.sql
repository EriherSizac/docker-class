-- db/init.sql
-- Postgres ejecuta automáticamente los archivos de /docker-entrypoint-initdb.d/
-- la PRIMERA vez que arranca con el volumen de datos vacío.
-- Para re-ejecutarlo: docker compose down --volumes && docker compose up -d

CREATE TABLE IF NOT EXISTS tareas (
  id     SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  hecha  BOOLEAN NOT NULL DEFAULT false,
  creada TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO tareas (titulo, hecha) VALUES
  ('Probar el contenedor', true),
  ('Levantar el stack con Compose', false),
  ('Consultar /tareas desde la API', false);
