// Tests del enrutador (sin necesidad de base de datos), con node --test.
const test = require("node:test");
const assert = require("node:assert");
const { matchRoute } = require("../src/server.js");

test("GET /health -> health", () => {
  assert.strictEqual(matchRoute("GET", "/health"), "health");
});

test("GET / -> root", () => {
  assert.strictEqual(matchRoute("GET", "/"), "root");
});

test("GET /tareas -> listTareas", () => {
  assert.strictEqual(matchRoute("GET", "/tareas"), "listTareas");
});

test("POST /tareas -> createTarea", () => {
  assert.strictEqual(matchRoute("POST", "/tareas"), "createTarea");
});

test("ruta desconocida -> notFound", () => {
  assert.strictEqual(matchRoute("GET", "/no-existe"), "notFound");
});
