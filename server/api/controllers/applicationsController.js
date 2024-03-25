// server/api/controllers/applicationsController.js
const Application = require("../models/applications");
const ExcelJS = require("exceljs");
const db = require("../config/db");

exports.listAllApplications = async (req, res) => {
  try {
    const applications = await Application.listAllApplications();
    res.json(applications);
  } catch (error) {
    console.error("List Applications Error:", error);
    res.status(500).send("Failed to list applications due to an internal error.");
  }
};
exports.createApplication = async (req, res) => {
  const { name } = req.body;
  try {
    await Application.createApplication(name);
    res.status(201).send(`Application '${name}' created successfully.`);
  } catch (error) {
    console.error("Create Application Error:", error);
    res.status(500).send("Failed to create an application due to an internal error.");
  }
};

exports.getApplicationTranslations = async (req, res) => {
  const { name } = req.params;
  try {
    const app = await Application.getApplicationTranslations(name);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Translations");

    worksheet.columns = [
      { header: "Key", key: "key", width: 30 },
      { header: "English", key: "en", width: 30 },
      { header: "French", key: "fr", width: 30 },
      { header: "Dutch", key: "nl", width: 30 },
      // Add more languages if necessary
    ];

    // Transform data into the expected structure for the Excel worksheet
    let translationData = {};
    app.forEach((t) => {
      if (!translationData[t.translation_key]) {
        translationData[t.translation_key] = { key: t.translation_key };
      }
      translationData[t.translation_key][t.language_code] = t.translation_text;
    });

    // Add rows to the worksheet
    Object.values(translationData).forEach((row) => {
      worksheet.addRow(row);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${name}-translations.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Get Application Translations Error:", error);
    res.status(404).send("Translations not found for the specified application.");
  }
};

exports.addApplicationTranslations = async (req, res) => {
  const { name } = req.params;
  const { translations } = req.body;
  try {
    await Application.addApplicationTranslations(name, translations);
    res.status(200).send("Translations added successfully.");
  } catch (error) {
    console.error("Add Translations Error:", error);
    res.status(500).send("Failed to add translations due to an internal error.");
  }
};

exports.deployApplicationTranslations = async (req, res) => {
  const { name } = req.params;
  try {
    await Application.deployApplicationTranslations(name);
    await Application.updateDeploymentDate(name);
    res.send(`Translations for '${name}' deployed successfully.`);
  } catch (error) {
    console.error("Deploy Translations Error:", error);
    res.status(500).send("Failed to deploy translations due to an internal error.");
  }
};

exports.getDeploymentDate = async (req, res) => {
  const { name } = req.params;
  try {
    const lastDeployed = await Application.getDeploymentDate(name);
    res.json({ lastDeployed });
  } catch (error) {
    console.error("Get Deployment Date Error:", error);
    res.status(500).send("Failed to fetch deployment date due to an internal error.");
  }
};

exports.deleteApplicationAndTranslations = async (req, res) => {
  const { name } = req.params;

  try {
    // Begin transaction
    await db.transaction(async (trx) => {
      // Find application by name to get its id
      const application = await trx("applications").where({ name }).first();
      if (!application) {
        return res.status(404).send("Application not found.");
      }

      // Use the application's id to delete translations
      await trx("translations").where({ application_id: application.id }).del();

      // Then delete the application itself
      await trx("applications").where({ id: application.id }).del();
    });

    res.status(200).send(`Application '${name}' and associated translations deleted successfully.`);
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).send("Failed to delete the application.");
  }
};

module.exports = exports;
