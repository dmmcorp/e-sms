# E-SMS (Electronic School Management System)

This is a [Next.js](https://nextjs.org) application for managing school data, built with Convex as the backend.

## Prerequisites

Before you can run this project, you need to have the following installed on your system:

1.  **Node.js:** This project requires Node.js. We recommend using the latest LTS (Long Term Support) version. You can download it from [nodejs.org](https://nodejs.org/). Node.js comes bundled with `npm` (Node Package Manager), which is used to install project dependencies.
2.  **Code Editor:** A code editor is recommended for viewing and potentially modifying the code. [Visual Studio Code (VS Code)](https://code.visualstudio.com/) is a popular free option.
3.  **Git (Optional):** If you need to clone the project repository from a source like GitHub, you will need Git installed.

## Setup Instructions

Follow these steps to get the project running locally:

1.  **Get the Code:**

    - If you received the project files as a ZIP archive, extract them to a folder on your computer.
    - If you need to clone it from a repository, open your terminal or command prompt, navigate to where you want to store the project, and run:
      ```bash
      git clone <repository_url>
      cd e-sms # Navigate into the project directory
      ```
      (Replace `<repository_url>` with the actual URL of the Git repository).

2.  **Install Dependencies:**
    Open your terminal or command prompt _inside the project folder_ (`e-sms`) and run one of the following commands to install the necessary libraries:

    ```bash
    npm install
    # or if you prefer yarn
    # yarn install
    # or if you prefer pnpm
    # pnpm install
    ```

3.  **Set Up Environment Variables:**

    - Create a file named `.env.local` in the root of the project folder (`e-sms`).
    - Add the following line to this file, replacing `<your-convex-deployment-url>` with the specific Convex deployment URL provided to you:
      ```env
      # filepath: .env.local
      NEXT_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
      ```
    - _Note:_ You might need other environment variables depending on the project configuration (e.g., for authentication providers). Please refer to any additional setup documentation provided.

4.  **Run the Convex Backend Dev Server:**
    The Convex backend needs to be running locally to interact with the database and execute backend functions. Open a _separate_ terminal or command prompt window inside the project folder and run:
    ```bash
    npx convex dev
    ```
    - The first time you run this, it might ask you to log in to Convex and link the project. Follow the on-screen instructions.
    - Keep this terminal window open while you are developing. It synchronizes your backend code (`convex/` folder) with the Convex service.

## Running the Development Server

Once the setup is complete and the Convex dev server is running (from Step 4 above), you can start the Next.js frontend application.

1.  Open a _new_ terminal or command prompt window inside the project folder (keep the `npx convex dev` window running).
2.  Run one of the following commands:

    ```bash
    npm run dev
    # or
    # yarn dev
    # or
    # pnpm dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) (or the port specified in the terminal output) with your web browser to see the application.

The application should now be running locally, connected to the Convex backend development environment. Changes you make to the frontend code (e.g., in the `src/app/` directory) should automatically update in your browser.
