---
title: "README"
---


Providentia Network is a Django + frontend project that hosts the "Providentia" reasoning/automation system.

This repository contains a Django backend (in `providentia/` and `manage.py`) and a frontend built with Vite + React (in `src/` and `package.json`).

## Quick Start

1. Create and activate a Python virtual environment:

    ```bash
    python -m venv .venv
    source .venv/bin/activate
    ```

2. Install Python dependencies:

    ```bash
    pip install -r requirements.txt
    ```

3. Install frontend dependencies:

    ```bash
    npm install
    ```

4. Run the Django development server:

    ```bash
    python manage.py migrate
    python manage.py runserver
    ```

5. (Optional) Run the frontend dev server:

    ```bash
    npm run dev
    ```

## Repository layout (high level)

- `providentia/` - Django project module (settings, urls, wsgi/asgi)
- `manage.py` - Django management wrapper
- `outdated/` - legacy scripts (archived). See `archive/` for copies
- `Data/`, `Modules/`, `Assets/` - project modules and static assets
- `src/` - frontend source (React + Vite)

## Notes

- Some legacy files live under `outdated/`. A copy has been placed in `archive/` for reference.
- Keep secrets out of the repo. Use a `.env` file (already present) and ensure `.env` is in `.gitignore`.

## Next steps

- Add project-specific developer docs (endpoints, environment variables)
- Add tests for core modules and a CI job
