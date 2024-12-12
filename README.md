# Video Diary

## This is an Test case for SevenApps

## Features
Bottom Tab,
Details Page For Displaying Video And Editing Data
Record video diary entries and store them locally.
View video entries with playback controls.
Edit and update video details.
Manage app data using SQLite.
Video Management With Expo-Video
Crop Video With FFMPEG
Usage Of Tanstack Query With FFMPEG

## Installation
To get started with the project, follow these steps:

## Prerequisites
Make sure you have the following installed on your machine:

Node.js
Expo CLI
### 1. Clone the repository

git clone https://github.com/KeremAkdemir1/video-diary.git
cd video-diary
### 2. Install dependencies
Run the following command to install all required dependencies:

npx yarn install / yarn install

npx yarn prebuild / yarn prebuild

### 3. Start the development server
Expo Go is not supporting FFMPEG because of this we have to use custom development server

npx yarn android / yarn android
Or
npx yarn ios / yarn ios

## Dependencies

This project uses the following dependencies:

expo: The main Expo SDK to build React Native apps.
expo-router: Simplifies routing for Expo projects.
expo-sqlite: Provides SQLite support for local data storage.
expo-video: Plays videos within the app.
@react-navigation/native and @react-navigation/bottom-tabs: For navigating between screens.
@tanstack/react-query: For data fetching and caching.
ffmpeg-kit-react-native: For video processing capabilities.