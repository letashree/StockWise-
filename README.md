# StockWise — Inventory Management App

A MERN-stack inventory management application built as a technical-assessment project.

## Features
- Create, view, edit, and delete inventory items
- Search items by name, SKU, or category
- Filter by category and low-stock status
- Track quantity, price, and stock value
- Dashboard summaries: item count, total units, inventory value, low-stock count
- Server-side validation and consistent API errors
- Responsive React interface

## Stack
- MongoDB + Mongoose
- Express.js + Node.js
- React + Vite
- Axios
- CSS

## Prerequisites
- Node.js 20+ (or a current LTS version)
- npm
- MongoDB local instance or MongoDB Atlas connection string
- VS Code with Code0 installed

## Setup
1. Open this project in VS Code and use Code0 during implementation, debugging, refactoring, and testing.
2. Create `server/.env` using `server/.env.example` as a template.
3. Set `MONGODB_URI` and `PORT=5000`.
4. In a terminal, run:
   ```bash
   cd server
   npm install
   npm run dev
   ```
5. In a second terminal:
   ```bash
   cd client
   npm install
   npm run dev
   ```
6. Open the local URL printed by Vite, usually `http://localhost:5173`.

## API
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/items` | List items; supports `search`, `category`, `lowStock=true` |
| GET | `/api/items/:id` | Get one item |
| POST | `/api/items` | Create item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## Example item
```json
{
  "name": "Wireless Mouse",
  "sku": "WM-001",
  "category": "Accessories",
  "quantity": 18,
  "price": 799,
  "lowStockThreshold": 5
}
```

## Code0 and AI-assisted development
I used Code0 as an AI-assisted development tool during the project.I reviewed generated suggestions,ran the application,checked API responses and manually tested CRUD flows before keeping changes 
