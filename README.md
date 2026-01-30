
# 🇾🇪 YemenJPT Digital Platform (V25.0 - Enterprise Edition)

**YemenJPT (Yemen Journalist Pre-trained Transformer)** is a self-hosted, integrated digital ecosystem designed specifically to empower journalists and media organizations in Yemen. The platform enhances press freedom by providing a secure, sovereign environment and a comprehensive suite of tools for Open Source Intelligence (OSINT), information verification, data analysis, and collaborative journalistic work.

This document serves as the primary technical guide for deploying and managing the YemenJPT platform.

---

## ✨ 1. Vision & Core Features

The platform is an all-in-one digital workspace providing critical capabilities for the modern investigative journalist. It is built on the principle of **data sovereignty**, allowing the entire system to run on private infrastructure, ensuring sensitive data never transits through third-party services. A key security feature is the **"Digital Chameleon" panic mode**, allowing an administrator to instantly switch the main application entry point to a decoy website in an emergency.

### Core Platform Modules

| Category                          | Tools & Features                                                                                                    | Purpose for Journalists                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Cognitive Core (AI)**           | `Ollama`, `Open WebUI`, `Qdrant`, `Langfuse`, `LibreTranslate`, `Whisper WebUI`                                         | Accelerates research, transcribes interviews, provides a feedback mechanism for AI improvement, and enables secure translation.   |
| **Data Factory (RLHF)**           | `Label Studio`                                                                                                      | Enables human-in-the-loop feedback to grade and correct AI responses, building a custom "Yemeni Instruct Dataset".          |
| **Investigation & OSINT**         | `SearXNG`, `SpiderFoot`, `ChangeDetection.io`, `ArchiveBox`, `Social-Analyzer`                                      | Gathers intelligence, automates reconnaissance, tracks website changes, and creates permanent web archives.                   |
| **Media Verification**            | `Meedan Check`                                                                                                      | Fights misinformation by providing a robust toolkit to verify the authenticity of images, videos, and claims.           |
| **Media Broadcasting & Publishing** | `AzuraCast` (Radio), `Restreamer` (Video), `Ghost` (Blog/Newsletter), `Mixpost` (Social), `Poste.io` (Email Server) | Creates a full, sovereign media empire for broadcasting radio, live-streaming video, publishing articles, and managing social media. |
| **Collaboration & Workflow**      | `Mattermost`, `Nextcloud`, `Webtop`, `n8n` (Automation), `Evolution API` (WhatsApp)                                   | Streamlines teamwork, allowing for secure communication, task management, isolated browsing, and workflow automation.        |
| **System & Identity**             | `Keycloak` (SSO), `Vaultwarden` (Passwords), `Portainer`, `Glances`, `Uptime Kuma`                                     | Manages user identity, secures passwords, and provides tools for system monitoring and container management.              |
| **Security**                      | Internal Nginx Proxy (Digital Chameleon) & Backend API for Docker control                                           | Provides an emergency decoy mechanism and allows secure, UI-driven management of container services.                     |

---

## 🏗️ 2. Architecture Overview

The application is built on a modern, containerized architecture designed for security, portability, and ease of management.

-   **Orchestration**: The entire stack is managed via **Docker Compose**, defining all services, volumes, and networks in a single, declarative file.
-   **Application**: An **Angular** frontend (`yemenjpt_app`) and a **Node.js** backend (`backend`) provide the main user interface and API layer. The backend includes a secure API for managing Docker services.
-   **AI Services**: **Ollama** and **Whisper** run on the server's CPU, providing local AI capabilities.
-   **Databases**: **PostgreSQL** and **MariaDB** serve as robust, persistent data stores for the various platform services.
-   **Identity**: **Keycloak** acts as a central Identity and Access Management (IAM) provider for Single Sign-On (SSO).
-   **Internal Proxy & Decoy**: A dedicated **Nginx** container (`internal_proxy`) is the key component of the "Digital Chameleon" panic mode, allowing it to dynamically switch traffic between the real frontend and a harmless decoy site.
-   **Dashboards**: **Dashy** is used to create role-specific portals, providing a unified user experience.

---

## 🚀 3. Deployment Guide

This guide is for deploying the platform on a fresh **Ubuntu 24.04 LTS** server.

### 3.1. Prerequisites

1.  **Server**: A fresh Ubuntu 24.04 LTS server with root access.
2.  **Domain Name**: A domain you own (e.g., `ph-ye.org`).
3.  **Git**: `git` command-line tool installed (`sudo apt install git`).

### 3.2. Automated Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-repo/YemenJPT-Platform.git
    cd YemenJPT-Platform
    ```

2.  **Configure Environment File (`.env`)**
    This is the most critical step. Copy the example file and fill out all required values using a text editor like `nano`.
    ```bash
    cp .env.example .env
    nano .env
    ```
    -   **`DOMAIN`**: Your main domain (e.g., `ph-ye.org`).
    -   **Passwords**: Use a password manager to generate strong, unique passwords.

3.  **Run the Installation Script**
    Make the script executable and run it as root. It will automate the entire setup process.
    ```bash
    chmod +x install.sh
    sudo ./install.sh
    ```
    The script will:
    -   Install Docker and Docker Compose.
    -   Create all necessary data directories under `/opt/presshouse`.
    -   Copy all configuration files to `/opt/presshouse`.
    -   Launch all services via Docker Compose.

### 3.3. Accessing the Application

After the script finishes, services will be accessible on `localhost` at their specified ports. You will need to configure a reverse proxy (like Nginx or Traefik) to expose them to your domain.
-   **Main Application**: `http://localhost:8080`
-   **AzuraCast Radio**: `http://localhost:8088`
-   **Ghost Publishing**: `http://localhost:2368`
-   **Poste.io Mail Server**: `http://localhost:8089`
-   **Label Studio**: `http://localhost:8090`
-   **WhatsApp API**: `http://localhost:8093` (Evolution API)
-   ... and many more. Refer to `docker-compose.yml` for all port mappings.

---

## 🛡️ 4. Security: Panic Mode & Service Control

-   **Panic Mode**: The backend includes an API endpoint (`/api/panic`) which executes a script to shut down critical services in an emergency. This can be triggered from the Admin Dashboard.
-   **Service Control**: The backend also provides an API (`/api/service/:action`) to securely start, stop, and restart containers, managed via the "System Stats" panel in the Admin Dashboard.

---

## 🔧 5. Maintenance & Operations

All operational commands should be run from the main application directory.

-   **Updating the Application**: To apply updates from the Git repository:
    ```bash
    git pull
    sudo ./deploy.sh
    ```
-   **Viewing Logs**: To see real-time logs from all running services:
    ```bash
    cd /opt/presshouse && sudo docker compose logs -f
    ```
-   **Stopping the Application**:
    ```bash
    cd /opt/presshouse && sudo docker compose down
    ```
-   **Starting the Application**:
    ```bash
    cd /opt/presshouse && sudo docker compose up -d
    ```

---

## 🧠 6. Model Context Protocol (MCP) & "Chat-to-Action"

The core of YemenJPT's intelligence is the **Model Context Protocol (MCP)**, a "Chat-to-Action" orchestration layer implemented within the Angular frontend. It enables the AI to understand user requests in natural language and trigger actions on the platform.

### 6.1. Architectural Flow

1.  **User Input**: A user types a command into the "AI Core" chat (e.g., *"Launch a new radio station named YemenFM"*).

2.  **Context Assembly (Frontend)**: Before sending the prompt to Gemini, the Angular application dynamically generates a `function_declaration` manifest based on the user's permissions. This manifest includes simple actions like `run_tool` and complex actions like `create_radio_station`.

3.  **AI Deliberation (Gemini)**: The Gemini model receives the prompt and the manifest of available functions. It understands the user's intent and decides to call the appropriate function (e.g., `create_radio_station(stationName: 'YemenFM')`).

4.  **Function Call Response**: The Gemini API returns a `functionCall` object, instructing the frontend to execute the function with the given arguments.

5.  **Frontend Execution**: The Angular application receives the `functionCall`.
    *   It identifies the requested action (e.g., `create_radio_station`).
    *   It logs the action to the **Audit Log**.
    *   It calls a secure backend API endpoint, which in turn executes a script to perform the action (e.g., uses the AzuraCast API or Docker commands).
    *   It provides feedback in the chat interface: *"Understood. Initiating creation of radio station 'YemenFM'..."*.

This implementation creates a powerful, context-aware, and secure orchestration system directly within the client, fulfilling the core vision of the YemenJPT platform.
