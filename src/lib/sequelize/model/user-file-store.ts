import { DataTypes, Sequelize } from "sequelize";

export default async (sequelize: Sequelize) => {
  return sequelize.define(
    "UserFileStore",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      contentType: {
        type: DataTypes.ENUM("FEED_IMAGE", "PROFILE_IMAGE"),
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      contentId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      originalUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      originalCompressedUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      smallUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mediumUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      largeUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    { timestamps: false, modelName: "UserFileStore", freezeTableName: true }
  );
};
