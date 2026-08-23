-- Criba del chat de la web (23/08/2026).
-- Columna para poder silenciar los avisos por email de una conversación concreta.
-- Aditiva y con valor por defecto: no toca ni una fila existente.
-- HAY QUE EJECUTARLA EN LA BASE DE DATOS DE PRODUCCIÓN **ANTES** DE DESPLEGAR EL CÓDIGO.
ALTER TABLE "ChatSession" ADD COLUMN IF NOT EXISTS "blocked" BOOLEAN NOT NULL DEFAULT false;
