# SwapSkill

SwapSkill is a modern, swipe-based skill-sharing platform that connects people who want to learn something new with those who can teach it. Inspired by the ease of use of dating apps, SwapSkill makes finding a learning partner fun and efficient.

## ✨ Key Features

-   **🎴 Swipe Matching**: Discover potential partners by swiping through cards showcasing their skills and what they want to learn.
-   **💬 Real-time Chat**: Connect and communicate instantly with your matches to arrange skill exchange sessions.
-   **👤 User Profiles**: Customize your profile with the skills you possess and those you desire to acquire.
-   **📍 Map Integration**: Find learners and teachers in your local area for in-person collaborations.
-   **🔐 Secure Authentication**: Integrated with Firebase for a safe and seamless login/registration experience.
-   **✨ Onboarding**: A smooth onboarding flow to get you started with the right information.

## 🛠️ Tech Stack

-   **Frontend**: React Native with Expo
-   **Backend/Database**: Firebase (Authentication, Firestore, Storage)
-   **Navigation**: React Navigation (Native Stack, Bottom Tabs)
-   **Styling**: React Native Paper, Custom Design
-   **Maps**: React Native Maps
-   **Animations**: React Native Reanimated, Deck Swiper
-   **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (LTS version)
-   [Expo Go](https://expo.dev/client) app on your mobile device (to preview the app)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd SwapSkill
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
    ```

4.  **Start the application**:
    ```bash
    npx expo start
    ```
    Scan the QR code with your Expo Go app to see it in action.

## 📂 Project Structure

-   `App.tsx`: The entry point of the application.
-   `src/components/`: Reusable UI components.
-   `src/navigation/`: Navigation configuration (Stacks and Tabs).
-   `src/screens/`: Feature-specific screens grouped by `auth` and `app` flows.
-   `src/services/`: External API or Firebase service interactions.
-   `src/constants/`: App-wide constants including the skills list.
-   `src/theme/`: Global styling and theme information.

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
