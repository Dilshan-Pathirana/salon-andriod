'use strict';
/**
 * configure-android-signing.js
 *
 * Injects a release signingConfig into the Expo-generated android/app/build.gradle.
 * Run this AFTER `expo prebuild --platform android` and BEFORE `./gradlew assembleRelease`.
 *
 * The signing credentials are read from Gradle project properties injected as
 * ORG_GRADLE_PROJECT_RELEASE_* environment variables by the CI workflow:
 *
 *   ORG_GRADLE_PROJECT_RELEASE_STORE_FILE     (path relative to android/app — default: ../../signing/release.keystore)
 *   ORG_GRADLE_PROJECT_RELEASE_STORE_PASSWORD
 *   ORG_GRADLE_PROJECT_RELEASE_KEY_ALIAS
 *   ORG_GRADLE_PROJECT_RELEASE_KEY_PASSWORD
 */

const fs   = require('fs');
const path = require('path');

const GRADLE_PATH = path.join(__dirname, '..', 'android', 'app', 'build.gradle');

if (!fs.existsSync(GRADLE_PATH)) {
  console.error(
    'ERROR: android/app/build.gradle not found.\n' +
    'Run: npx expo prebuild --platform android --non-interactive --clean'
  );
  process.exit(1);
}

let src = fs.readFileSync(GRADLE_PATH, 'utf8');

if (src.includes('signingConfigs')) {
  console.log('Signing config already present in build.gradle — nothing to do.');
  process.exit(0);
}

// ── Step 1 ──────────────────────────────────────────────────────────────────
// Wire the existing release buildType to use signingConfigs.release.
// Do this FIRST (before adding the signingConfigs block) so that the
// regex below only matches the one "release {" inside buildTypes.
src = src.replace(
  /([ \t]+release\s*\{[ \t]*\n)/,
  '$1            signingConfig signingConfigs.release\n'
);

// ── Step 2 ──────────────────────────────────────────────────────────────────
// Insert the signingConfigs block immediately before the buildTypes block.
// Gradle project properties with the ORG_GRADLE_PROJECT_ prefix are
// automatically available as project.PROPERTY_NAME inside build.gradle.
const signingBlock = `
    signingConfigs {
        release {
            storeFile file((project.findProperty("RELEASE_STORE_FILE") ?: "../../signing/release.keystore").toString())
            storePassword (project.findProperty("RELEASE_STORE_PASSWORD") ?: "").toString()
            keyAlias     (project.findProperty("RELEASE_KEY_ALIAS")     ?: "").toString()
            keyPassword  (project.findProperty("RELEASE_KEY_PASSWORD")  ?: "").toString()
        }
    }
`;

src = src.replace(/(\n[ \t]+buildTypes[ \t]*\{)/, signingBlock + '$1');

fs.writeFileSync(GRADLE_PATH, src, 'utf8');
console.log('✓  Release signing configuration injected into android/app/build.gradle');
