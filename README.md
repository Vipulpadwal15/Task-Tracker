# Task Tracker — JTRONIX

A modern, responsive, and intuitive task management application built with **React** and **Vite**. Features real-time state persistence, smooth interactive animations, dynamic status filtering, and comprehensive validation.

---

## ✨ Features

- **Task Management**: Create, complete, and delete tasks seamlessly.
- **Validation & Duplicate Detection**: Prevents empty input and duplicate task names (case-insensitive) with clear error messaging.
- **Filter Views**: Easily toggle between **All**, **Pending**, and **Completed** tasks with dynamic counter badges.
- **Real-Time Statistics**: Live overview tracking Total, Pending, and Completed tasks with dynamic completion progress.
- **Micro-Interactions & Motion**:
  - Smooth slide-up entrance animation for newly created tasks.
  - Graceful slide & fade-out collapse animation on task removal.
  - Hover elevation with subtle left-accent indicators.
- **Local Persistence**: Tasks are saved locally to `localStorage` and restored automatically across page refreshes.
- **Accessibility & Keyboard Navigation**: Full keyboard navigation support (Enter to add, Space to toggle, Delete key focus) with accessible ARIA labels.
- **Responsive Layout**: Designed mobile-first, ensuring an optimal experience across phones, tablets, and desktop displays.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Bundler / Dev Server**: [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Modular, CSS Custom Properties, Responsive Media Queries)
- **Linting**: Oxlint

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vipulpadwal15/Task-Tracker.git
   cd Task-Tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📄 License

This project was developed as part of the JTRONIX Frontend Internship Assessment.
