# Build the APK on GitHub from your phone

1. Create a GitHub repository, e.g. `real-navigation-pro`.
2. Upload the CONTENTS of this folder to the repository root (do not upload this ZIP as the only file).
3. Open the repository's **Actions** tab.
4. Choose **Build Android APK**.
5. Tap **Run workflow**.
6. When the workflow finishes, open the completed run.
7. Under **Artifacts**, download `Real-Navigation-Pro-debug`.
8. Extract it and install `app-debug.apk` on Android.

The workflow builds with JDK 17, Android SDK 35 and Gradle 8.10.2.

IMPORTANT:
- The TomTom API key is not embedded in the APK.
- The app expects a deployed HTTPS backend for `/api/geocode`, `/api/route`, `/api/incidents`, and traffic tiles.
- Do not commit `.env` files or API secrets to GitHub.
