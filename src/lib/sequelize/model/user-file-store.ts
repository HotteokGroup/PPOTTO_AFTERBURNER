import { DataTypes, Sequelize } from "sequelize";

export default async (sequelize: Sequelize) => {
  return sequelize.define(
    "UserFileStore",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      contentType: {
        type: DataTypes.ENUM("FEED_IMAGE", "PROFILE_IMAGE"),
        allowNull: false,
      },
      contentId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      originalFileUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      smallThumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mediumThumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      largeThumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      disconnectedAt: {
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
