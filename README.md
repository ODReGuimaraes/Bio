# Oficina de Dança Renata Guimarães - Bio Landing Page

A customizable "Link in Bio" landing page built for Oficina de Dança Renata Guimarães. This application allows for showcasing important links, social media profiles, and contact information in a clean, responsive interface. It includes an administration dashboard to easily manage the content.

## Features

-   **Public Landing Page:** A mobile-friendly view displaying designated links and information.
-   **Admin Dashboard:** A protected interface to add, edit, or remove links and update configuration.
-   **Responsive Design:** Optimized for mobile devices (typical for Instagram bio links) but works great on desktop too.
-   **Modern Tech Stack:** Built with performance and developer experience in mind.

## Tech Stack

-   **React:** UI library.
-   **Vite:** Fast build tool and development server.
-   **TypeScript:** Static typing for better code quality.
-   **Tailwind CSS:** Utility-first CSS framework for styling.
-   **Framer Motion:** For smooth animations.
-   **Lucide React:** Icon set.
-   **React Router:** For navigation between the public view and admin area.

## Getting Started

### Prerequisites

-   Node.js (v16 or higher recommended)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Pedroou/OD-Renata-Guimar-es-Bio-Landing-Page.git
    cd OD-Renata-Guimar-es-Bio-Landing-Page
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173` (the port shown in your terminal).

## Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the app for production.
-   `npm run preview`: Preview the production build locally.

## Project Structure

-   `/components`: Reusable UI components (Buttons, Logo, etc.).
-   `/pages`: Main page views (PublicView is loaded via App or separate component, Admin pages).
-   `/context`: React Context for state management (ContentContext).
-   `/utils`: Helper functions and mappings (iconMap).

## Deployment

This project is configured to be deployed on GitHub Pages.
Homepage: [https://Pedroou.github.io/OD-Renata-Guimar-es-Bio-Landing-Page](https://Pedroou.github.io/OD-Renata-Guimar-es-Bio-Landing-Page)
