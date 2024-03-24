// server/api/models/applications.js
const db = require("../config/db");

async function listAllApplications() {
  try {
    const applications = await db.select("name").from("applications");
    return applications.map((app) => app.name);
  } catch (error) {
    console.error("Failed to list applications:", error);
    throw error;
  }
}

async function createApplication(name) {
  try {
    await db("applications").insert({ name });
  } catch (error) {
    console.error("Error creating application:", error);
    throw error;
  }
}

async function getApplicationTranslations(appName) {
  try {
    const app = await db("applications").where({ name: appName }).first();
    if (app) {
      const translations = await db("translations")
        .where({ application_id: app.id, is_live: true })
        .select("language_code", "translation_key", "translation_text");
      return translations;
    }
    return null; // or throw an error if the app is not found
  } catch (error) {
    throw error;
  }
}

async function addApplicationTranslations(name, translations) {
  try {
    const app = await db("applications").where({ name }).first();
    if (app) {
      await db.transaction(async (trx) => {
        for (const translation of translations) {
          // Check if a translation with the same key already exists
          const existingTranslation = await trx("translations")
            .where({
              application_id: app.id,
              language_code: translation.language_code,
              translation_key: translation.translation_key,
            })
            .first();

          if (existingTranslation) {
            // Update the existing translation
            await trx("translations").where({ id: existingTranslation.id }).update({
              translation_text: translation.translation_text,
              // Set to false if you want to make it non-live immediately,
              // or to existingTranslation.is_live to keep its current status
              is_live: false,
            });
          } else {
            // Insert new translation
            await trx("translations").insert({
              application_id: app.id,
              language_code: translation.language_code,
              translation_key: translation.translation_key,
              translation_text: translation.translation_text,
              is_live: false, // or true if you want it to be live immediately
            });
          }
        }
      });
    } else {
      throw new Error(`Application with name ${name} not found`);
    }
  } catch (error) {
    console.error("Error adding/updating translations:", error);
    throw error; // Or handle the error as needed
  }
}

// async function addApplicationTranslations(name, translations) {
//   try {
//     const app = await db("applications").where({ name }).first();
//     if (app) {
//       const translationInserts = translations.map((translation) => ({
//         application_id: app.id,
//         language_code: translation.language_code,
//         translation_key: translation.translation_key,
//         translation_text: translation.translation_text,
//         is_live: false, // Or however you're handling the live status
//       }));
//       await db("translations").insert(translationInserts);
//     } else {
//       throw new Error(`Application with name ${name} not found`);
//     }
//   } catch (error) {
//     console.error("Error adding translations:", error);
//     throw error; // Or handle the error as needed
//   }
// }

async function deployApplicationTranslations(name) {
  try {
    const app = await db("applications").where({ name }).first();
    if (app) {
      await db("translations").where({ application_id: app.id }).update({ is_live: true });
    }
  } catch (error) {
    console.error("Error deploying translations:", error);
    throw error;
  }
}

async function updateDeploymentDate(name) {
  try {
    await db("applications").where({ name }).update({ last_deployed: new Date().toISOString() });
  } catch (error) {
    console.error("Error updating deployment date:", error);
    throw error;
  }
}

async function getDeploymentDate(name) {
  try {
    const app = await db("applications").where({ name }).select("last_deployed").first();
    return app ? app.last_deployed : "Not deployed yet";
  } catch (error) {
    console.error("Error getting deployment date:", error);
    throw error;
  }
}

async function deleteTranslations(applicationId) {
  await db("translations").where({ application_id: applicationId }).del();
}

async function deleteApplication(applicationId) {
  await db("applications").where({ id: applicationId }).del();
}

module.exports = {
  listAllApplications,
  createApplication,
  getApplicationTranslations,
  addApplicationTranslations,
  deployApplicationTranslations,
  updateDeploymentDate,
  getDeploymentDate,
  deleteTranslations,
  deleteApplication,
};
