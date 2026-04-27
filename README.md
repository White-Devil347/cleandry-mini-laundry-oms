# CleanDry - Mini Laundry Order Management System

Lightweight laundry order system built for fast execution with AI-assisted development.

## Setup

### Prerequisites
- Node.js 18+
- npm

### Local Run
```bash
npm install
npm start
```

App URLs:
- UI: http://localhost:3000
- API base: http://localhost:3000/api

### Environment Variables
Copy [.env.example](.env.example) to `.env` and adjust if needed.

## Features Implemented

### 1. Create Order
- Input: customer name, phone number, garment items with quantity
- Hardcoded/configured garment pricing
- Output: unique `orderId` + calculated `totalAmount`

### 2. Order Status Management
Supported statuses:
- RECEIVED
- PROCESSING
- READY
- DELIVERED

Status update endpoint included.

### 3. View Orders
- List all orders
- Filter by status
- Search by customer name or phone number
- Sort orders (newest/oldest/amount high-low/amount low-high)
- Quick status chips for one-click filtering

### 4. Dashboard
Returns:
- Total orders
- Total revenue
- Average order value
- Delivered rate
- Visual status breakdown bars

### Bonus
- Simple frontend dashboard UI
- Estimated delivery date on order creation
- Optional file-based storage mode (`STORAGE_MODE=file`)
- Multi-garment order creation in UI
- Live bill preview in create order form
- Friendly order confirmation card (no raw JSON in UI)

## API Endpoints

Health:
- `GET /api/health`

Orders:
- `POST /api/orders`
- `GET /api/orders?status=READY&search=9876`
- `PATCH /api/orders/:orderId/status`
- `GET /api/orders/meta/pricing`
- `GET /api/orders/meta/statuses`

Dashboard:
- `GET /api/dashboard`

Versioned aliases are also available:
- `/api/v1/orders`
- `/api/v1/dashboard`

## Demo Artifacts
- Postman collection: [postman/CleanDry.postman_collection.json](postman/CleanDry.postman_collection.json)
- Browser demo UI at `/`

## Production-Ready Notes

Implemented for deployment readiness:
- Security headers via Helmet
- Compression middleware
- API rate limiting
- Request logging (Morgan)
- Centralized error + 404 handlers
- Graceful shutdown on SIGINT/SIGTERM
- Environment-based config
- Dockerfile + Render deploy spec

### Docker Deploy
```bash
docker build -t cleandry .
docker run -p 3000:3000 --env-file .env cleandry
```

### Render Deploy
- [render.yaml](render.yaml) is included.
- Create new Render Web Service from this repo.

## AI Usage Report

### AI Tools Used
- GitHub Copilot (primary)
- ChatGPT (prompt ideation and quick structure review)

### Sample Prompts Used
1. "Build Express endpoints for create order, list/filter orders, update status, and dashboard totals."
2. "Generate validation rules for customer name, phone number, garment type, and quantity."
3. "Refactor API into controller/service/repository structure with clean separation."
4. "Improve a basic HTML dashboard UI into a polished but lightweight operations console."
5. "Make this Node API production-deployment ready with env config and middleware hardening."

### Where AI Helped
- Fast initial scaffolding
- Boilerplate route/controller generation
- Frontend structure and style draft

### What AI Got Wrong / What I Improved
- Tightened payload validation (phone/quantity rules and clear errors)
- Standardized response shape and endpoint behavior
- Refactored from basic structure to controller/service/repository layout
- Added production middleware and deployment files
- Reworked plain UI into a cleaner operations dashboard

## Tradeoffs

Kept intentionally simple:
- No authentication
- No full relational/NoSQL DB integration
- No automated test suite in this version

If extended:
1. Add auth + role permissions
2. Add PostgreSQL/MongoDB persistence
3. Add unit/integration tests
4. Add CI/CD pipeline and monitored production deployment

## Submission Checklist

- Code is structured, runnable, and documented
- Required features from assignment are implemented
- AI usage report and sample prompts are included
- Postman collection is included
- Docker + Render deployment configs are included

Before final submission, complete these manual steps:
1. Push this code to a public GitHub repository
2. Deploy and share live app URL (Render recommended)
3. Add demo screenshots or Loom link to README (optional but strong)
