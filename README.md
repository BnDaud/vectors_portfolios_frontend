# Vectors Portfolios Frontend

This is the **frontend** of the Vectors Portfolios application, built using **React** and **Vite**. The application allows users to create, view, and manage professional portfolios. It features a responsive design, dynamic routing, and state management using React Context.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
  - [How to Customize](#how-to-customize)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Dynamic Profiles**: View and manage user profiles with skills and portfolio details.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **React Context**: Centralized state management for seamless data sharing across components.
- **Dynamic Routing**: Navigate between profiles and pages using React Router.
- **Vite for Development**: Fast development environment with hot module replacement (HMR).
- **Customizable**: Easily extendable to add more features.

---

## Technologies Used

- **React**: Frontend library for building user interfaces.
- **Vite**: Fast build tool for modern web projects.
- **React Router**: For routing and navigation.
- **Tailwind CSS**: For styling and responsive design.
- **ESLint**: For code linting and maintaining code quality.

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

Make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/vectors_portfolios_frontend.git

    cd vectors_portfolios_frontend

    npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Visit the application at:

```bash
http://localhost:3000
```

## Folder Structure

```
src/
├── components/          # Reusable React components
│   ├── Sections/        # Page sections (e.g., Home, About)
│   ├── allprofiles.jsx  # Component for displaying all profiles
│   ├── template.jsx     # Main template component
├── App.jsx              # Main application entry point
├── index.css            # Global styles
├── main.jsx             # React DOM rendering
├── assets/              # Static assets (images, icons, etc.)
├── styles/              # Additional CSS or Tailwind configurations
```

---

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
