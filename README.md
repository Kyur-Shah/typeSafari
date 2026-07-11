# TypeSafari 🦁⌨️

TypeSafari is an engaging, interactive typing tutor web application designed specifically for kids! Built with React and HTML5 Canvas, it combines essential typing practice with highly dynamic, beautifully animated mini-games to make learning to type an adventure.

## Features ✨

*   **Learn & Type Dashboard:** A foundational practice area where kids follow on-screen visual instructions to learn key placements.
*   **Balloon Burst Game 🎈:** A physics-based mini-game where kids must type the correct letters to burst floating balloons before they escape. Features an adaptive difficulty system (Junior vs. Arcade modes).
*   **Fruit Ninja Game 🍉⚔️:** A high-octane canvas game where kids slice flying fruits by typing their corresponding letters. Features dynamic slicing animations, particle effects, and an engaging Japanese Taiko drum & flute soundtrack.
*   **Multi-Profile Support 👤:** Parents/Teachers can manage multiple kid profiles. The game automatically saves progress, scores, and levels for each profile using local storage.
*   **Admin Dashboard ⚙️:** A dedicated control panel to manage user profiles, reset scores, and toggle global game settings (e.g., swapping between standard soft-click or mechanical keyboard sounds, enabling diagnostic tools).

## Technology Stack 🛠️

*   **Core:** React, Vite
*   **Styling:** Modern CSS (Glassmorphism, CSS Variables, Responsive Design)
*   **Graphics:** HTML5 Canvas (60fps game loops)
*   **Audio:** Web Audio API (Synthesized sound effects, dynamic background tracks)
*   **Icons:** Lucide React

## Getting Started 🚀

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Kyur-Shah/typeSafari.git
    cd typeSafari
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to `http://localhost:5173` to start playing!

## How to Play 🎮

1.  Select or create a new profile from the **Admin** tab.
2.  Navigate to the **Learn & Type** tab for basic lessons.
3.  Jump into **Balloon Burst** or **Fruit Ninja** to put those skills to the test!
4.  Earn points, level up, and become a typing master!
