# Per Diem Booking App

A React Native booking application with a "Family" wallet-inspired aesthetic, featuring Google Sign-In, time-context awareness (NYC vs Local), and automated opening notifications.

## 📺 Demo

Watch the application in action: [Loom Demo](https://www.loom.com/share/552118a1b56e4f399732e8aeede53481)

## 🚀 Setup and Run Instructions

### Prerequisites

- Node.js >= 20
- macOS (for iOS development)
- CocoaPods (for iOS)
- Android Studio / SDK (for Android)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install iOS pods:
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

1. **Start Metro Bundler**:
   ```bash
   npm start -- --reset-cache
   ```
2. **Run on iOS**:
   ```bash
   npm run ios
   ```
3. **Run on Android**:
   ```bash
   npm run android
   ```

## 🧠 Approach Notes

### UI/UX: The "Family" Aesthetic

The app implements a premium dashboard inspired by contemporary crypto wallets:

- **Bento Grid**: A widget-based layout on the `HomeScreen` for clear information hierarchy.
- **Squircles**: High border radii (`28pt`) used across all cards and sections.
- **Soft Shadows**: Diffused, low-opacity shadows for a clean "floating" feel.
- **Floating Action Button**: A primary black pill FAB for the main booking action.

### State Management & Data

- **Zustand**: Used for global app state (auth, timezone preference, booking data) with **MMKV** for high-performance persistence.
- **Tanstack Query**: Handles server-side state (store hours, overrides) with automatic caching and refetching.

### Logic & Time Handling

- **Timezone Awareness**: Seamlessly toggles between "NYC" (America/New_York) and "Local" time using `date-fns-tz`.
- **Hybrid Auth**: Supports both standard Email/Password login (via custom API) and Google Sign-In (via Firebase).
- **Notifications**: Integrated with `Notifee` to schedule reminders when the store opens.

## ⚠️ Assumptions and Limitations

- **Google Sign-In**: Requires valid `GoogleService-Info.plist` (iOS) and `google-services.json` (Android) to be configured in the respective native folders.
- **API Availability**: Assumes the Heroku-hosted challenge API is active for email login and store data fetching.
- **Store Hours**: The "Store Status" logic assumes all base hours provided by the API are in the `America/New_York` timezone.
- **Environment**: Developed and tested for React Native 0.83.1.

---

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an overview of React Native and how to set up your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a guided tour of the React Native basics.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native Blog posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub repository for React Native.
