
# PQMS Backend (Django + DRF)

A production-ready starting backend for the 工程・品質管理システム React app.

## Features
- Django 5 + DRF
- JWT auth (SimpleJWT)
- CORS enabled
- Entities: Users, Categories, Check Items, Checklists (+ items), Process Sheets, Executions (+ item results + photos), Tasks
- Filtering, searching, ordering, pagination
- OpenAPI schema + Swagger UI at `/api/docs/`
- Media uploads for execution photos
- Fixtures for quick demo data

## Quickstart

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py loaddata fixtures/initial_data.json
python manage.py runserver 0.0.0.0:8000
```

## Auth
- `POST /api/auth/jwt/create/` with `{ "username": "...", "password": "..." }`
- Use `Authorization: Bearer <access>`

## Endpoints
- `/api/users/` (admin only)
- `/api/categories/`
- `/api/check-items/`
- `/api/checklists/` (+ nested `items_write`)
- `/api/checklist-items/` (read-only)
- `/api/process-sheets/`
- `/api/executions/` (+ nested `item_results_write`)
- `/api/execution-item-results/` (read-only)
- `/api/execution-photos/`
- `/api/tasks/`

Open API docs at `/api/docs/`.
