require('dotenv').config()
const express = require("express");
const { Client } = require("@notionhq/client");
const cors = require("cors");


const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || "localhost";

// Verificar si las variables de entorno están configuradas
if (!process.env.NOTION_API_SECRET || !process.env.DATABASE_ID) {
  console.error(
    "Por favor, asegúrate de configurar las variables de entorno NOTION_API_SECRET y DATABASE_ID."
  );
  process.exit(1);
}

const notion = new Client({
  auth: process.env.NOTION_API_SECRET,
});

// Función para obtener los datos de Notion
async function getTable() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.DATABASE_ID,
    });

    return response.results.map((item) => item.properties);
  } catch (error) {
    console.error("Error al obtener datos de Notion:", error.message);
    throw new Error("Error al obtener datos de Notion");
  }
}

// Ruta para obtener los datos de la tabla desde Notion
app.get("/tabla-notion", async (req, res) => {
  try {
    const data = await getTable();
    res.json(data);
  } catch (error) {
    console.error("Error en la ruta '/tabla-notion':", error.message);
    res
      .status(500)
      .json({ error: "Error al obtener los datos de la tabla desde Notion" });
  }
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("Error no manejado:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, HOST, () => {
  console.log(`Servidor en ejecución en http://${HOST}:${PORT}`);
});
