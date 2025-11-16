Video Diary App

# Screenshots Folder 📸

Place your app screenshots here with the following names:

## Required Screenshots:

### Main Screens

- `main-screen.png` - Main screen with video grid
- `empty-state.png` - Empty state with Lottie animation
- `grid-view.png` - Grid view layout
- `list-view.png` - List view layout

### Video Creation Flow

- `video-selection.png` - Step 1: Video selection screen
- `video-trimming.png` - Step 2: Video trimming with slider
- `add-details.png` - Step 3: Add name and description

### Video Details

- `video-details.png` - Video details screen (view mode)
- `edit-mode.png` - Video details screen (edit mode)

## Recommended Size

- Width: 1170px (iPhone 13/14 Pro Max)
- Height: 2532px
- Format: PNG with transparency (if needed)

## 🎯 Features

- **Video Selection & Trimming**: Select videos from gallery and trim them to 5-second segments
- **Video Gallery**: Browse your video entries in grid or list layout
- **Video Details & Editing**: View, edit, and delete video entries
- **Persistent Storage**: All videos stored locally with AsyncStorage
- **Beautiful UI**: Modern dark theme with smooth animations
- **Empty States**: Engaging Lottie animations for empty states

## 🛠️ Tech Stack

Required Technologies
• Core Technologies
• Expo: Base framework for React Native development.
• Expo Router: For implementing app navigation.
• Zustand: State management solution.
• Tanstack Query: To manage async logic and the expo-trim-video cropping process.
• expo-trim-video: Core library for video processing.
• NativeWind: Styling solution.
• Expo Video: Video rendering and playback (or any suitable alternative).
• Bonus Technologies
• React Native Reanimated: For animations.

tHİS APP HAS 3 SCREEENS AND EDITING FEATURE:
Main Screen
Details Page
Crop Modal

### Core Framework

- **React Native** (0.76.6) - Mobile app framework
- **Expo** (~52.0.31) - Development platform
  - expo-router (4.0.17) - File-based routing
  - expo-av - Video playback and manipulation
  - expo-image-picker - Gallery access
  - expo-media-library - Media management

### UI & Styling

- **NativeWind** (^4.1.23) - Tailwind CSS for React Native
- **Tailwind CSS** (^3.4.17) - Utility-first CSS framework
- **React Native Reanimated** (^3.16.8) - Advanced animations
- **Lottie React Native** (^7.2.0) - Vector animations
- **@expo/vector-icons** - Icon library

### State Management

- **Zustand** (^5.0.3) - Lightweight state management
- **AsyncStorage** (@react-native-async-storage/async-storage) - Persistent storage

### Video Processing

- **@react-native-community/slider** - Video timeline slider
- **react-native-compressor** (^1.8.24) - Video compression
- **expo-video-thumbnails** - Thumbnail generation
- **expo-file-system** - File operations

### Data Fetching

- **TanStack Query** (@tanstack/react-query ^5.64.2) - Async state management

### Navigation

- **Expo Router** - File-based routing system
- **React Native Gesture Handler** - Touch gestures

### Development Tools

- **TypeScript** (^5.3.3) - Type safety
- **Prettier** (^3.4.2) - Code formatting
  - prettier-plugin-tailwindcss - Tailwind class sorting

## 📁 Project Structure

```
testcase02/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with navigation
│   ├── index.tsx                # Main screen (video gallery)
│   ├── crop-modal.tsx           # Video selection & trimming modal
│   ├── details/
│   │   └── [videoId].tsx        # Video details & editing screen
│   └── global.css               # Global Tailwind styles
│
├── src/
│   ├── components/              # Reusable components
│   │   └── SimpleVideoSlider.tsx
│   ├── hooks/                   # Custom hooks
│   │   └── useVideoTrimming.ts
│   ├── store/                   # Zustand stores
│   │   └── videoStore.ts
│   ├── types/                   # TypeScript types
│   │   └── index.ts
│   └── utils/                   # Utility functions
│       └── videoUtils.ts
│
├── assets/                      # Images, Lottie animations
│   ├── empty.json              # Empty state animation
│   ├── Gallery.json            # Gallery selection animation
│   └── UFO404.json             # 404 animation
│
├── tailwind.config.js          # Tailwind configuration
├── metro.config.js             # Metro bundler config
├── babel.config.js             # Babel configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies

```

### Step 1: Install Dependencies

```bash
npm install --legacy-peer-deps
```

> **Note**: I use `--legacy-peer-deps` due to React 19.1.0 compatibility requirements.

### Step 2: iOS Setup (macOS only)

```bash
npx expo prebuild --clean
cd ios && pod install && cd ..
```

### Step 3: Run the App

#### iOS Simulator

```bash
npx expo run:ios
```

#### iOS Simulator

does not support Expo go beacuse expo-trim-video package does not support expo go

## App Features

### 1. Main Screen

- **Grid/List Toggle**: Switch between grid and list view
- **Video Cards**: Display video thumbnails with duration and creation date
- **Empty State**: Lottie animation when no videos exist
- **Add Button**: Navigate to video creation flow

### 2. Video Creation Flow (3 Steps)

1. **Select Video**: Choose from gallery (does not supports iCloud videos)
2. **Trim Video**: Select 5-second segment with visual timeline
3. **Add Details**: Enter name and description

### 3. Video Details Screen

- **Video Playback**: Full video player with native controls
- **Edit Mode**:
  - Click "Edit" to modify name/description
  - Click "Save" to confirm changes
  - Click "Cancel" to discard changes
- **Delete**: Remove video with confirmation dialog

## Styling

The app uses **NativeWind** for styling, which brings Tailwind CSS to React Native:

### Color Palette

- Background: `#141121` (dark purple)
- Primary: `#1c6e5d` (teal green)
- Accent: `#4f30e8` (purple)
- Text: `#ffffff` (white) / `#94a3b8` (slate)

## 🔧 Configuration Files

### tailwind.config.js

```javascript
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

### metro.config.js

```javascript
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./app/global.css" });
```

## Key Dependencies

| Package                 | Version  | Purpose              |
| ----------------------- | -------- | -------------------- |
| react                   | 19.1.0   | UI library           |
| react-native            | 0.76.6   | Mobile framework     |
| expo                    | ~52.0.31 | Development platform |
| expo-router             | 4.0.17   | File-based routing   |
| nativewind              | ^4.1.23  | Tailwind for RN      |
| zustand                 | ^5.0.3   | State management     |
| @tanstack/react-query   | ^5.64.2  | Data fetching        |
| react-native-reanimated | ^3.16.8  | Animations           |
| lottie-react-native     | ^7.2.0   | Vector animations    |

## Data Structure

### VideoEntry

```typescript
interface VideoEntry {
  id: string; // Unique identifier
  name: string; // Video title
  description: string; // Video description
  uri: string; // Local file path
  thumbnail?: string; // Optional thumbnail path
  duration: number; // Duration in seconds
  createdAt: string; // ISO timestamp
}
```

### CropData

```typescript
interface CropData {
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  duration: number; // Total duration (always 5s)
}
```

## State Management

The app uses **Zustand** with persistence:

```typescript
// Store location: src/store/videoStore.ts
const { videos, addVideo, removeVideo, updateVideo, getVideo } =
  useVideoStore();
```

**Available Actions:**

- `addVideo(video)` - Add new video entry
- `removeVideo(id)` - Delete video by ID
- `updateVideo(id, updates)` - Update video name/description
- `getVideo(id)` - Get single video by ID

## Troubleshooting

### Issue: "Couldn't find a navigation context"

### Issue: iCloud video selection fails

**Solution**: Download the video in Photos app first, then try selecting again.

## 📝 Scripts

```json
{
  "start": "expo start",
  "android": "expo run:android",
  "ios": "expo run:ios",
  "prebuild": "expo prebuild --clean"
}
```

## 🔐 Permissions Required

- **Media Library**: To access and select videos
- **Camera Roll**: To save processed videos (iOS)
