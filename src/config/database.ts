import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/**
 * Sequelize instance configured to connect to the PostgreSQL database.
 * Uses the DB_NAME, DB_USER, DB_PASSWORD, DB_HOST and DB_PORT environment variables.
 */
const sequelize = new Sequelize(
  process.env.DB_NAME || "riwischool_plus",
  process.env.DB_USER || "postgres",
  process.env.DB_PASSWORD || "postgres",
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export default sequelize;
