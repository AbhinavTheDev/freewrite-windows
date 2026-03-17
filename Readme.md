# Freewrite Windows

A minimal, distraction-free writing app built with [Tauri](https://tauri.app/) and [Vite](https://vite.dev/).

---

## Prerequisites

Before setting up this project, make sure the following are installed on your system:

| Requirement | Version | Reference |
|------------|---------|-----------|
| **Node.js** | ≥ 18 | [nodejs.org](https://nodejs.org/) |
| **Rust & Cargo** | stable | [rustup.rs](https://rustup.rs/) |
| **Tauri CLI prerequisites** | – | [Tauri Prerequisites Guide](https://v2.tauri.app/start/prerequisites/) |
| **Vite** (bundled as dev dependency) | ≥ 7 | [Vite Getting Started](https://vite.dev/guide/) |

> **New to Tauri?** Follow the official [Tauri v2 Getting Started](https://v2.tauri.app/start/) guide to configure your system before proceeding.

---

## Installation & Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/AbhinavTheDev/freewrite-windows.git
cd freewrite-windows
```

### 2. Install root dependencies (Tauri CLI)

```bash
npm install
```

### 3. Install frontend dependencies

```bash
npm install --prefix ./app-ui
```

---

## Running the App

### Development mode

Starts the Vite dev server and the Tauri window with hot-reload:

```bash
npm run tauri:dev
```

### Production build

Compiles the frontend and bundles the native app installer:

```bash
npm run tauri:build
```

The output installer will be placed in `src-tauri/target/release/bundle/`.

---

## Project Structure

```
freewrite-windows/
├── app-ui/          # Vite frontend (HTML, CSS, JS)
│   ├── src/
│   ├── index.html
│   └── vite.config.js
├── src-tauri/       # Tauri / Rust backend
│   ├── src/
│   └── tauri.conf.json
└── package.json     # Root scripts & Tauri CLI dependency
```

---

## License

See [LICENSE](./LICENSE) for details.