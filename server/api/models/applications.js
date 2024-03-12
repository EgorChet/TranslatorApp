// server/api/models/applications.js

const fs = require("fs").promises;
const path = require("path");

const TRANSLATIONS_DIR = path.join(__dirname, "../../translations");
const LIVE_TRANSLATIONS_DIR = path.join(__dirname, "../../live_translations");

/**
 * Generates the path to the metadata file for a given application.
 * @param {string} name The name of the application.
 * @returns {string} Path to the metadata file.
 */
const getDeploymentMetadataPath = (name) => path.join(LIVE_TRANSLATIONS_DIR, `${name}-metadata.json`);

/**
 * Reads and parses JSON from a given file path.
 * @param {string} filePath Path to the JSON file.
 * @returns {Promise<Object>} Parsed JSON object from the file.
 */
const readJsonFromFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading from ${filePath}:`, error);
    throw error; // Consider more nuanced error handling based on error codes
  }
};

/**
 * Writes an object as JSON to a given file path.
 * @param {string} filePath Path to the file where JSON should be written.
 * @param {Object} data Data to be written as JSON.
 * @returns {Promise<void>}
 */
const writeJsonToFile = async (filePath, data) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent);
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    throw error; // Consider more nuanced error handling based on error codes
  }
};

async function listAllApplications() {
  try {
    const files = await fs.readdir(TRANSLATIONS_DIR);
    return files.map((file) => path.basename(file, ".json"));
  } catch (error) {
    console.error("Failed to list applications:", error);
    throw error;
  }
}

async function createApplication(name) {
  const filePath = path.join(TRANSLATIONS_DIR, `${name}.json`);
  await writeJsonToFile(filePath, {});
}

async function getApplicationTranslations(name) {
  const filePath = path.join(TRANSLATIONS_DIR, `${name}.json`);
  return await readJsonFromFile(filePath);
}

async function addApplicationTranslations(name, translations) {
  const filePath = path.join(TRANSLATIONS_DIR, `${name}.json`);
  const currentData = await readJsonFromFile(filePath).catch(() => ({}));
  const updatedData = { ...currentData, ...translations };
  await writeJsonToFile(filePath, updatedData);
}

async function deployApplicationTranslations(name) {
  const sourcePath = path.join(TRANSLATIONS_DIR, `${name}.json`);
  const targetPath = path.join(LIVE_TRANSLATIONS_DIR, `${name}.json`);
  await fs.copyFile(sourcePath, targetPath);
  await updateDeploymentDate(name);
}

async function updateDeploymentDate(name) {
  const metadataPath = getDeploymentMetadataPath(name);
  const metadata = { lastDeployed: new Date().toISOString() };
  await writeJsonToFile(metadataPath, metadata);
}

async function getDeploymentDate(name) {
  const metadataPath = getDeploymentMetadataPath(name);
  try {
    const metadata = await readJsonFromFile(metadataPath);
    return metadata.lastDeployed;
  } catch (error) {
    return "Not deployed yet";
  }
}

module.exports = {
  listAllApplications,
  createApplication,
  getApplicationTranslations,
  addApplicationTranslations,
  deployApplicationTranslations,
  updateDeploymentDate,
  getDeploymentDate,
};

