## Translation Management System

### Overview

This Translation Management System offers an efficient approach for managing UI translations across various applications. Developed with a Node.js backend and a React frontend, it enables streamlined management and deployment of translation files.

The system uses ElephantSQL for database management, featuring two primary tables to organize and store data:

Applications Table: Stores details about each application, including its unique ID, name, and last deployment timestamp. For example:
id name last_deployed
108 Facebook.com 2024-03-20 08:42:10 +0000
109 Instagram.com 2024-03-20 08:42:12 +0000
107 Google.com 2024-03-20 08:45:49 +0000
106 Apple.com 2024-03-24 21:08:52 +0000

Translations Table: Contains the translations, linking them to their respective application by ID. It includes fields for language code, translation key, translation text, and a flag to indicate if the translation is currently live. For instance:

    id application_id language_code translation_key   translation_text is_live
    91      106             en          Hello               Hello       false
    92      106             fr          Hello               Bonjour     false
    93      106             nl          Hello               Hallo       false

Users can easily view and add new applications, download translations in Excel format, and manage translation keys for effective app localization. This system simplifies the translation management process, ensuring efficient localization workflow for any application.
