# QuickDesk Frontend

QuickDesk is an AI-assisted helpdesk frontend built for the coding assessment. It gives employees a simple way to raise tickets and gives agents a clean workspace to review, reply, resolve, and audit support requests.

The frontend is intentionally simple and practical. The main focus is on the real helpdesk workflow, not on extra decoration.

## Tech Stack

- React
- Vite
- Tailwind CSS
- Axios
- React Router
- React Hot Toast
- Lucide React Icons

## Main Roles

### Employee

Employees can:

- Register and login
- Create a support ticket
- Add title, description, and optional attachment filename
- Ask for an AI category and priority suggestion before submitting
- View only their own tickets
- Track ticket status
- View the final reply after an agent resolves the ticket

### Agent

Agents can:

- Login with an agent account
- View all submitted tickets
- Filter tickets by status, category, and priority
- Search tickets by title
- Open ticket details
- See employee information
- See AI-suggested category and priority
- Override category or priority
- View override audit history
- See AI-drafted reply with knowledge base citations
- Edit the reply and resolve the ticket

## Pages

| Page | Purpose |
|------|---------|
| Login | User login and JWT storage |
| Register | Employee account creation |
| Dashboard | Role-based overview |
| Create Ticket | Employee ticket submission |
| My Tickets / All Tickets | Employee sees own tickets, agent sees all tickets |
| Ticket Details | Ticket information, AI draft, override, audit log, and reply |
| Profile | Basic logged-in user information |

## Frontend Workflow

### Employee Ticket Flow

```text
Employee Login
-> Create Ticket
-> Enter title, description, attachment filename
-> Optional AI suggestion preview
-> Submit ticket
-> Backend stores AI category and priority
-> Employee tracks ticket in My Tickets
```

### Agent Resolution Flow

```text
Agent Login
-> Open All Tickets
-> Filter or search ticket
-> Open ticket detail
-> Review AI category and priority
-> Review AI draft reply and citations
-> Override category/priority if needed
-> Edit final reply
-> Send reply
-> Ticket becomes Resolved
```

## API Connection

The frontend uses Axios from:

```text
src/services/api.js
```

Default backend URL:

```text
http://localhost:3000
```

JWT token is stored in `localStorage` after login and sent automatically in the `Authorization` header:

```text
Authorization: Bearer <token>
```

## Important Routes Used By Frontend

| Method | Endpoint | Used For |
|--------|----------|----------|
| POST | /auth/register | Register user |
| POST | /auth/login | Login user |
| GET | /ai/category-priority | AI category/priority preview |
| POST | /tickets | Create employee ticket |
| GET | /tickets/my | Employee ticket list |
| GET | /tickets | Agent ticket list |
| GET | /tickets/:id | Ticket detail |
| PATCH | /tickets/:id/override | Agent override |
| PATCH | /tickets/:id/reply | Agent reply and resolve |

## How To Run

Install dependencies:

```powershell
cd quickdesk-frontend
npm install
```

Start development server:

```powershell
npm run dev
```

Build frontend:

```powershell
npm run build
```

Preview production build:

```powershell
npm run preview
```

## Testing The Flow

Example employee ticket:

```text
Title: Cannot connect to VPN

Description:
I am working remotely and cannot connect to the company VPN. The VPN client fails after login and MFA approval. I am blocked from accessing internal tools.

Attachment filename:
vpn-error.png
```

Expected AI suggestion:

```text
Category: IT
Priority: HIGH
```

The agent should then open the ticket, see the AI draft reply, check citations, edit the reply if needed, and send the final response.

## Current Status

Completed in frontend:

- Authentication screens
- Role-based navigation
- Employee ticket creation
- AI suggestion preview
- Employee ticket list
- Agent all-ticket list
- Filters and title search
- Ticket detail view
- AI draft reply display
- Citation display
- Category/priority override UI
- Override audit log UI
- Final reply editor
- Resolved ticket display

Pending or not fully implemented:

- Real-time updates with Socket.io, WebSockets, or SSE
- Agent metrics dashboard

## Notes

Role enforcement is handled by the backend. The frontend only improves the user experience by showing the correct screens and actions for each role.

The AI draft reply is shown to the agent, but the agent remains responsible for the final message sent to the employee.
