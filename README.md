# Lokale Internal System

An internal operations system for Lokale, a social commerce platform. This system enables role-based access control, task management, and cross-departmental visibility for startup teams.

## 🔐 Role & Board Access System

### User Roles
The system supports four immutable user roles:
- **Founder / Ops Manager** - Full system access with board-switching capability
- **Marketing** - Access to marketing and growth campaigns
- **Partnerships / Growth** - Access to brand onboarding and partnerships
- **IT / Product** - Access to IT/Product board

### Board Access Rules

#### For Non-Founder Users:
- ✅ Role is **permanently assigned** at signup
- ✅ Locked to their **default board** (cannot switch)
- ✅ No board-switching controls visible
- ✅ Automatic redirect if attempting to access unauthorized boards
- ✅ Can access shared modules: Tasks, Projects

#### For Founder/Ops Manager:
- ✅ Can **switch between all department boards**
- ✅ Board switching is **session-only** (doesn't modify role)
- ✅ Role remains "Founder / Ops Manager" at all times
- ✅ Can view any department's board to monitor operations
- ✅ Board selection persists during session only

### Default Boards by Role
- **Founder / Ops Manager** → Dashboard (`/`)
- **Marketing** → Growth & Campaigns (`/growth`)
- **Partnerships / Growth** → Brand Onboarding (`/onboarding`)
- **IT / Product** → IT/Product Board (`/it-board`)

## 🏗️ Technical Implementation

### Key Components

**AuthContext** (`src/context/AuthContext.jsx`)
- Manages user authentication and role assignment
- Maintains `activeBoard` state (session-only, never persisted)
- Provides `switchBoard()` function (Founder-only)
- Enforces role immutability

**BoardGuard** (`src/components/BoardGuard.jsx`)
- Route-level access control
- Automatically redirects unauthorized users
- Enforces board-locking for non-founders

**Sidebar** (`src/components/Sidebar.jsx`)
- Displays board switcher (Founders only)
- Filters menu items based on role
- Shows current user role (never changes)

### Data Structure

```javascript
// User object (stored in Firestore)
{
  uid: string,
  email: string,
  name: string,
  role: string,           // IMMUTABLE - set once at signup
  defaultBoard: string    // IMMUTABLE - matches role
}

// Session state (in-memory only)
{
  activeBoard: string     // MUTABLE - Founders can change, resets on logout
}
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Environment Setup
Create a `.env` file with your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## 📦 Core Modules

- **Dashboard** - Executive overview (Founder only)
- **Task Management** - Cross-team task tracking
- **Project Management** - Project lifecycle management
- **Growth & Campaigns** - Marketing campaigns and growth metrics
- **Brand Onboarding** - Vendor onboarding pipeline
- **Partnerships** - Partnership tracking and management
- **IT/Product Board** - Technical tasks and product development

## 🔒 Security

- Firestore security rules enforce role-based data access
- Client-side route guards prevent unauthorized navigation
- User roles are immutable and stored in Firestore
- Board switching never modifies user roles or database records
- Session-only state prevents persistent unauthorized access

## 📝 License

Private - Internal use only for Lokale team members.
