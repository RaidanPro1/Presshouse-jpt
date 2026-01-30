# 🇾🇪 YemenJPT Digital Platform (V4.101 - Enterprise Production)

**YemenJPT (Yemen Journalist Pre-trained Transformer)** is a self-hosted, integrated digital ecosystem designed to empower journalists and media organizations in Yemen. The platform enhances press freedom by providing a secure, sovereign environment and a comprehensive suite of tools for Open Source Intelligence (OSINT), information verification, data analysis, and collaborative journalistic work.

This document serves as the primary technical guide for deploying and managing the YemenJPT Enterprise platform.

---

## ✨ 1. Core Features & Stack

The platform is an all-in-one digital workspace providing critical capabilities for the modern investigative journalist. It is built on the principle of **data sovereignty**, allowing the entire system to run on private infrastructure.

| Category                | Service(s)                                                                       | Purpose                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Core Infrastructure** | `Nginx Proxy Manager`, `Portainer`, `Watchtower`, `Cloudflare Tunnel`              | Secure external access, container management, and automated updates.                                        |
| **Databases**           | `PostgreSQL`, `MariaDB`, `Redis`, `MinIO`                                        | Powering all applications with robust relational, cache, and S3-compatible object storage.                  |
| **The Brain (AI)**      | `Ollama`, `Node.js Backend`, `Label Studio`, `n8n`                                 | Local LLM serving, data labeling for RLHF, workflow automation, and system control.                         |
| **Media Empire**        | `Ghost`, `WordPress`, `AzuraCast`, `Restreamer`                                  | A complete sovereign media suite for blogging, news, radio broadcasting, and live video streaming.        |
| **Security & Ops**      | `Vaultwarden`, `LanguageTool`, `Gitea`, `"Panic Button" Script`                    | Secure password management, grammar checking, self-hosted Git, and emergency shutdown protocols.            |
| **Unified Controller**  | `Angular Dashboard`                                                              | The single pane of glass providing a unified UI for all platform capabilities.                              |

---

## 🏗️ 2. Architecture Overview

The application is built on a modern, containerized architecture designed for security, portability, and ease of management.

-   **Orchestration**: The entire stack is managed via **Docker Compose**, defining all services, volumes, and networks.
-   **Networking**: All services communicate over a secure, custom bridge network (`raidan_net`). Critical services have static IP addresses to prevent DNS resolution issues.
-   **Gateway**: **Nginx Proxy Manager** serves as the primary external gateway, managing all subdomains and SSL certificates.
-   **Security**: The "Digital Chameleon" panic mode is handled by a secondary **internal Nginx proxy** controlled by the backend API. This allows an administrator to instantly switch the main dashboard to a decoy site in an emergency.
-   **Persistence**: All application data is persisted in local Docker volumes under `/opt/raidanpro/data`, ensuring no data loss on container restarts.

---

## 🚀 3. Zero-Fail Deployment Guide (Ubuntu 24.04 LTS)

This guide details the automated installation process using the provided `install_master.sh` script for the domain `ph-ye.org`.

### 3.1. Prerequisites

1.  **Server**: A fresh Ubuntu 24.04 LTS server (or VM) with root access, with public IP `212.56.42.87`.
2.  **Domain Name**: The domain `ph-ye.org`, with its DNS managed by Cloudflare.
3.  **DNS Records**: Before starting, ensure you have an **A record** pointing your domain (`ph-ye.org`) and a wildcard A record (`*.ph-ye.org`) to your server's IP address (`212.56.42.87`).
4.  **Git & Curl**: These will be installed automatically by the script if not present.

### 3.2. Automated Installation Steps

1.  **Clone the Repository**
    Log in to your server as a user with `sudo` privileges and clone the deployment repository.
    ```bash
    git clone <your-repository-url>
    cd <repository-directory>
    ```

2.  **Configure Environment File (`.env`)**
    This is the most critical step. Copy the provided template and edit it to fill in your specific details. The `DOMAIN` is already set to `ph-ye.org`.
    ```bash
    cp .env.example .env
    nano .env
    ```
    -   **Passwords**: Replace all `generate_...` placeholders with strong, unique passwords generated from a password manager. Alternatively, leave them, and the script will generate them for you.
    -   **`CF_API_TOKEN`**: Provide your Cloudflare Tunnel token if you choose to use it.

3.  **Run the Installer Script**
    Make the script executable and run it with `sudo`. It will automate the entire setup process.
    ```bash
    chmod +x install_master.sh
    sudo ./install_master.sh
    ```
    The script will perform the following actions:
    -   **Pre-flight Checks**: Verifies system resources and installs Docker, Git, and Curl if they are missing.
    -   **Environment Setup**: Creates the final `.env` file with generated passwords for any that were left as defaults.
    -   **Directory & Network**: Creates the `/opt/raidanpro` data structure and the `raidan_net` Docker network.
    -   **Deployment**: Builds the custom frontend and backend images and launches the entire stack using `docker-compose up -d`.
    -   **Health Check**: Monitors a key service until it is live, then confirms a successful installation.

### 3.3. Post-Installation: Nginx Proxy Manager Setup

Once the script is complete, you must configure the gateway to expose your services.

1.  Navigate to `http://212.56.42.87:8181`.
2.  Log in to Nginx Proxy Manager for the first time. Default credentials are `admin@example.com` / `changeme`. You will be prompted to change these immediately.
3.  Go to **Hosts -> Proxy Hosts** and click **"Add Proxy Host"**.
4.  Create entries for each service. For example, to set up the main dashboard:
    -   **Domain Names**: `dashboard.ph-ye.org`
    -   **Scheme**: `http`
    -   **Forward Hostname / IP**: `yemenjpt_frontend` (use the service name from `docker-compose.yml`)
    -   **Forward Port**: `80`
    -   Enable **"Block Common Exploits"**.
    -   Go to the **SSL** tab, select **"Request a new SSL Certificate"**, enable **"Force SSL"** and **"HTTP/2 Support"**, and save.
5.  Repeat this process for other services like `gitea.ph-ye.org` (port 3000), `portainer.ph-ye.org` (port 9000), etc., as needed.

---

## 🔧 4. Maintenance & Operations

All operational commands should be run from the main application directory `/opt/raidanpro`.

-   **Viewing Logs**: To see real-time logs from all running services:
    ```bash
    cd /opt/raidanpro && sudo docker compose logs -f
    ```
-   **Stopping the Application**:
    ```bash
    cd /opt/raidanpro && sudo docker compose down
    ```
-   **Starting the Application**:
    ```bash
    cd /opt/raidanpro && sudo docker compose up -d
    ```