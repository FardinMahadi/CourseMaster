# CourseMaster - EdTech Platform

A full-featured educational technology platform built with Next.js, designed for
course management, student enrollment, and learning progress tracking.

## 🎯 Project Overview

CourseMaster is a comprehensive EdTech platform that enables:

- **Students** to browse courses, enroll, track progress, complete assignments,
  and take quizzes
- **Admins** to manage courses, batches, enrollments, and review student
  submissions

This project is part of the MISUN Academy technical assessment and is being
developed as a 4-day sprint.

## 🚀 Tech Stack

### Frontend

- **Framework**: [Next.js 16.0.6](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: Redux Toolkit
- **Forms**: React Hook Form with Zod validation
- **Fonts**: Geist Sans & Geist Mono

### Backend

- **Runtime**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Validation**: Zod v4
- **HTTP Client**: Axios with interceptors for security

### Development Tools

- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Type Checking**: TypeScript (strict mode)

## ✨ Features

### Public Features (Unauthenticated)

- Course listing with pagination
- Search courses by title/instructor
- Filter courses by category/tags
- Sort courses by price or title
- View course details and syllabus

### Student Features (Authenticated)

- User registration and login
- Student dashboard with enrolled courses
- Course player with video lectures
- Progress tracking per course
- Assignment submission (Google Drive links or text)
- Interactive quizzes with immediate scoring
- Lesson completion tracking

### Admin Features (Protected)

- Admin authentication with secret key
- Course CRUD operations
- Batch management
- Enrollment management and viewing
- Assignment review interface
- Analytics dashboard (planned)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **MongoDB** database (local or MongoDB Atlas)

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd misun-academy
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory with the following
   environment variables:

   ```env
   # ============================================
   # Database Configuration
   # ============================================
   # MongoDB connection string
   # For local MongoDB: mongodb://localhost:27017/coursemaster
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/coursemaster
   MONGODB_URI=your_mongodb_connection_string

   # ============================================
   # JWT Authentication
   # ============================================
   # Secret key for signing JWT tokens (use a strong random string)
   # Generate one with: openssl rand -base64 32
   JWT_SECRET=your_jwt_secret_key_here

   # JWT token expiration time (default: 7d)
   # Options: 1h, 24h, 7d, 30d, etc.
   JWT_EXPIRES_IN=7d

   # ============================================
   # Admin Configuration
   # ============================================
   # Secret key required for admin login
   # This should be a strong, unique string known only to admins
   ADMIN_SECRET_KEY=your_admin_secret_key_here

   # ============================================
   # Next.js Configuration
   # ============================================
   # Public API URL (optional, defaults to /api)
   # Use this if your API is hosted on a different domain
   # NEXT_PUBLIC_API_URL=http://localhost:3000/api

   # Application URL (optional, for production)
   # NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **📝 Important Notes:**
   - **Never commit `.env.local`** to version control (it's already in
     `.gitignore`)
   - **JWT_SECRET**: Use a strong, random string. See
     [How to Generate JWT_SECRET](#how-to-generate-jwt_secret) below
   - **ADMIN_SECRET_KEY**: Use the same method as JWT_SECRET to generate a
     secure key
   - **MONGODB_URI**:
     - **Local MongoDB**: `mongodb://localhost:27017/coursemaster`
     - **MongoDB Atlas**: Get your connection string from the Atlas dashboard
     - **📖 Need help?** See [MongoDB Setup Guide](#mongodb-setup) below

   **Example `.env.local` for local development:**

   ```env
   MONGODB_URI=mongodb://localhost:27017/coursemaster
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=7d
   ADMIN_SECRET_KEY=your_admin_secret_key_change_this
   ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the
   application.

## 🔑 How to Generate JWT_SECRET

A JWT_SECRET is a cryptographic key used to sign and verify JWT tokens. It must
be a strong, random string. Here are several methods to generate one:

### Method 1: Using Node.js (Recommended - Works on all platforms)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

This will output a secure random string like:

```
ywvscQHb/TKchjWrdyQKgshLW0fpWspakMnDUsLUfmE=
```

### Method 2: Using OpenSSL (macOS/Linux)

```bash
openssl rand -base64 32
```

### Method 3: Using PowerShell (Windows)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Method 4: Using Online Generator (Quick but less secure)

Visit
[https://generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
or use any secure random string generator.

### Method 5: Using Python

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### After Generating

Copy the generated string and paste it into your `.env.local` file:

```env
JWT_SECRET=ywvscQHb/TKchjWrdyQKgshLW0fpWspakMnDUsLUfmE=
```

**⚠️ Important:**

- Use a **different** JWT_SECRET for production
- Never share your JWT_SECRET publicly
- Keep it secure and rotate it periodically

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

1. **Install MongoDB** on your machine:
   - **Windows**: Download from
     [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Linux**: Follow
     [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB service**:

   ```bash
   # Windows (as Administrator)
   net start MongoDB

   # macOS/Linux
   brew services start mongodb-community
   # or
   sudo systemctl start mongod
   ```

3. **Use connection string**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/coursemaster
   ```

### Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Create a free account** at
   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new cluster** (choose the free tier)

3. **Create a database user**:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password

4. **Whitelist your IP address**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" for development (or add your specific
     IP)

5. **Get your connection string**:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `coursemaster` (or your preferred database name)

6. **Add to `.env.local`**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/coursemaster?retryWrites=true&w=majority
   ```

### Verify MongoDB Connection

After setting up MongoDB, start your development server. If the connection is
successful, you'll see no errors in the console. If there are connection errors,
check:

- MongoDB service is running (for local setup)
- Connection string is correct
- IP address is whitelisted (for Atlas)
- Database user credentials are correct

## 📁 Project Structure

```
misun-academy/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── course/         # Course-related components
│   │   ├── layout/         # Layout components (Navbar, Footer, etc.)
│   │   ├── shared/         # Shared/common components
│   │   ├── student/        # Student-specific components
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utility functions and helpers
│   │   ├── api/            # API client utilities
│   │   ├── validations/    # Zod validation schemas
│   │   └── utils.ts        # General utilities
│   ├── models/             # Mongoose models
│   ├── store/              # Redux store configuration
│   │   └── slices/         # Redux slices
│   └── types/              # TypeScript type definitions
├── docs/                   # Documentation
│   ├── PROGRESS.md         # Development progress tracking
│   └── Technical Assessment_ Web Developer_MISUN Academy.pdf
├── public/                 # Static assets
└── package.json            # Dependencies and scripts
```

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 📊 Development Status

**Current Progress**: ~15% (Setup phase mostly complete)

**Current Phase**: Phase 1 - Project Setup & Infrastructure

**Status**: 🟡 In Progress

For detailed progress tracking, see [docs/PROGRESS.md](./docs/PROGRESS.md)

### Completed ✅

- Next.js 16.0.6 project initialization
- TypeScript configuration
- Tailwind CSS v4 setup
- shadcn/ui initialization
- ESLint and Prettier configuration
- Core dependencies installation
- Project directory structure

### In Progress 🟡

- Environment variables setup
- Database connection configuration
- Authentication system
- Database models

## 🔐 Authentication

The platform supports two types of users:

1. **Students**: Register and login with email/password
2. **Admins**: Login with admin credentials and secret key

Authentication uses JWT tokens stored in HTTP-only cookies for security.

### Authentication Features

- **JWT-based Authentication**: Secure token-based authentication with HTTP-only
  cookies
- **Role-Based Access Control**: Automatic route protection based on user roles
  (student/admin)
- **Middleware Protection**: Automatic route protection via Next.js middleware
- **Client-Side Hooks**: `useAuth()` hook for client-side authentication state
- **Server-Side Helpers**: Utilities for protected API routes and server
  components

### Route Protection

Routes are automatically protected by middleware:

- **Public Routes**: `/`, `/login`, `/register`, `/admin-login`, `/courses/[id]`
- **Student Routes**: `/dashboard`, `/courses/*` (enrolled courses)
- **Admin Routes**: `/admin/*`

### Authentication Utilities

- **Client-Side**: `useAuth()` hook provides user state, loading, and
  authentication status
- **Server-Side**: `requireAuth()`, `requireAdmin()`, `requireStudent()` helpers
  for API routes
- **Components**: `<ProtectedRoute>` component for client-side route protection

## 📚 API Routes

### Authentication

- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current authenticated user

### Courses

- `GET /api/courses` - List courses (with pagination, search, filter, sort)
- `POST /api/courses` - Create course (admin only)
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course (admin only)
- `DELETE /api/courses/[id]` - Delete course (admin only)

### Enrollments

- `POST /api/enrollments` - Enroll in a course
- `GET /api/enrollments` - List enrollments

### Progress

- `POST /api/progress` - Update learning progress
- `GET /api/progress` - Get progress data

### Assignments

- `POST /api/assignments` - Submit assignment
- `GET /api/assignments` - List assignments

### Quizzes

- `POST /api/quizzes` - Submit quiz
- `GET /api/quizzes/[id]` - Get quiz details

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components with the "New
York" style. Components are located in `src/components/ui/` and can be
customized as needed.

## 🚢 Deployment

### Vercel (Recommended)

The easiest way to deploy this Next.js app is using
[Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js app can be deployed on any platform that supports Node.js:

- [Netlify](https://netlify.com)
- [Railway](https://railway.app)
- [Render](https://render.com)
- [Heroku](https://heroku.com)

Make sure to set all required environment variables in your deployment platform.

## 📖 Documentation

- [Development Progress](./docs/PROGRESS.md) - Detailed progress tracking
- [Technical Assessment](./docs/Technical%20Assessment_%20Web%20Developer_MISUN%20Academy.pdf) -
  Project requirements

## 🤝 Contributing

This is a technical assessment project for MISUN Academy. Development follows a
structured 4-day timeline with specific phases and milestones.

## 📝 License

This project is part of a technical assessment and is for evaluation purposes.

## 🔗 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn) - Interactive tutorial
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

**Last Updated**: December 2, 2025
