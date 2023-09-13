import { Sequelize } from "sequelize";
import userFileStore from "./model/user-file-store";
import mysql2 from "mysql2";
let sequelize: Sequelize | null = null;

async function loadSequelize() {
  const database = process.env.DB_DATABASE || "";
  const user = process.env.DB_USER || "";
  const password = process.env.DB_PASSWORD || "";
  const sequelize = new Sequelize(database, user, password, {
    host: process.env.DB_HOST || "",
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
      },
    },
    dialectModule: mysql2,
    pool: {
      max: 1,
      min: 0,
      idle: 0,
      acquire: 3000,
      evict: 300,
    },
  });

  await sequelize.authenticate();

  return sequelize;
}

export const getSequelize = async () => {
  if (!sequelize) {
    sequelize = await loadSequelize();
  } else {
    sequelize.connectionManager.initPools();

    if (sequelize.connectionManager.hasOwnProperty("getConnection")) {
      delete sequelize.connectionManager.getConnection;
    }
  }

  return sequelize;
};
