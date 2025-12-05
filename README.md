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
- Course CRUD operations with comprehensive form (lessons, assignments, quizzes)
- Batch management (create, edit, list batches)
- Enrollment management and viewing with filters
- Assignment review and grading interface
- Analytics dashboard with statistics

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun** package manager
- **MongoDB** database (local or MongoDB Atlas)
- **Redis** (optional, for caching - application works without it)

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
   # Redis Configuration (Optional - for caching)
   # ============================================
   # Redis connection URL for caching API responses
   # For local Redis: redis://localhost:6379
   # For Redis Cloud: redis://username:password@host:port
   # If not provided, the application will work without caching (graceful degradation)
   # REDIS_URL=redis://localhost:6379

   # Cache TTL (Time To Live) in seconds (optional, defaults to 300 seconds / 5 minutes)
   # REDIS_CACHE_TTL=300

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
   # Optional: Redis for caching (application works without it)
   REDIS_URL=redis://localhost:6379
   REDIS_CACHE_TTL=300
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

## 🔴 Redis Setup (Optional - for Caching)

Redis is **optional** and used for caching API responses to improve performance.
The application will work perfectly fine without Redis, but caching will improve
response times for frequently accessed endpoints like the course listing API.

### Option 1: Local Redis

1. **Install Redis** on your machine:
   - **Windows**: Download from
     [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or
     use [WSL](https://docs.microsoft.com/en-us/windows/wsl/)
   - **macOS**: `brew install redis`
   - **Linux**: `sudo apt-get install redis-server` (Ubuntu/Debian) or
     `sudo yum install redis` (CentOS/RHEL)

2. **Start Redis service**:

   ```bash
   # Windows (using WSL or Redis service)
   redis-server

   # macOS
   brew services start redis

   # Linux
   sudo systemctl start redis
   # or
   redis-server
   ```

3. **Use connection string**:
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Option 2: Redis Cloud (Recommended for Production)

1. **Create a free account** at [Redis Cloud](https://redis.com/try-free/)

2. **Create a new database** (free tier available)

3. **Get your connection string**:
   - Copy the connection URL from your Redis Cloud dashboard
   - It will look like: `redis://default:password@host:port`

4. **Add to `.env.local`**:
   ```env
   REDIS_URL=redis://default:password@host:port
   REDIS_CACHE_TTL=300
   ```

### Cache Configuration

- **Cache TTL**: Default is 300 seconds (5 minutes). You can customize this with
  `REDIS_CACHE_TTL` environment variable.
- **Cache Invalidation**: Cache is automatically invalidated when courses are
  created, updated, or deleted.
- **Graceful Degradation**: If Redis is unavailable, the application will
  continue to work normally, just without caching.

### Verify Redis Connection

After setting up Redis, start your development server. If Redis is connected,
you'll see `✅ Redis Connected` in the console. If Redis is unavailable, you'll
see a warning but the application will continue to work:

- Redis service is running (for local setup)
- Connection string is correct
- Network access is allowed (for Redis Cloud)
- Credentials are correct (for Redis Cloud)

**Note**: Redis connection failures are handled gracefully - the application
will fall back to direct database queries if Redis is unavailable.

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

**Current Progress**: ~95% (All core features complete, testing and deployment
remaining)

**Current Phase**: Phase 5 - Admin Features (Complete)

**Status**: 🟢 Nearly Complete

For detailed progress tracking, see [docs/PROGRESS.md](./docs/PROGRESS.md)

### Completed ✅

- Next.js 16.0.6 project initialization
- TypeScript configuration
- Tailwind CSS v4 setup
- shadcn/ui initialization
- ESLint and Prettier configuration
- Core dependencies installation
- Project directory structure
- Authentication system (student & admin)
- Database models and connections
- Public course listing and details
- Student features (dashboard, course player, assignments, quizzes)
- Admin features (dashboard, course management, batch management, enrollment
  management, assignment review)
- Performance optimizations (database indexes, query optimization)
- UI components (Sidebar, Footer, ProgressTracker)
- Redux state management (auth, course, UI slices)

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

- `POST /api/assignments` - Submit assignment (student only)
- `GET /api/assignments` - List assignments (student only)
- `GET /api/assignments/[id]` - Get assignment details (student only)
- `GET /api/assignments/admin` - List all submissions (admin only)
- `GET /api/assignments/admin/[id]` - Get submission details (admin only)
- `PUT /api/assignments/admin/[id]` - Grade submission (admin only)
- `POST /api/assignments/admin` - Create assignment (admin only)
- `PUT /api/assignments/admin/[id]` - Update assignment (admin only)

### Quizzes

- `GET /api/quizzes` - List quizzes (student only)
- `GET /api/quizzes/[id]` - Get quiz details
- `POST /api/quizzes/[id]/submit` - Submit quiz (student only)
- `POST /api/quizzes/admin` - Create quiz (admin only)
- `PUT /api/quizzes/admin/[id]` - Update quiz (admin only)

### Lessons

- `POST /api/lessons` - Create lesson (admin only)
- `PUT /api/lessons/[id]` - Update lesson (admin only)
- `DELETE /api/lessons/[id]` - Delete lesson (admin only)

### Batches

- `GET /api/batches` - List batches (with filters)
- `POST /api/batches` - Create batch (admin only)
- `GET /api/batches/[id]` - Get batch details
- `PUT /api/batches/[id]` - Update batch (admin only)
- `DELETE /api/batches/[id]` - Delete batch (admin only)

### Admin Routes

- `GET /api/enrollments/admin` - List all enrollments (admin only)

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components with the "New
York" style. Components are located in `src/components/ui/` and can be
customized as needed.

## 🚢 Deployment

### Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are set in your deployment platform
- [ ] MongoDB Atlas is configured (recommended for production)
- [ ] Production build succeeds (`pnpm build`)
- [ ] All tests pass (see [Testing Guide](./docs/TESTING.md))
- [ ] API documentation is reviewed (see [API Documentation](./docs/API.md))

### Environment Variables for Production

Set the following environment variables in your deployment platform:

```env
MONGODB_URI=your_production_mongodb_connection_string
JWT_SECRET=your_production_jwt_secret_key
JWT_EXPIRES_IN=7d
ADMIN_SECRET_KEY=your_production_admin_secret_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**Important**: Use different secrets for production than development!

### Vercel (Recommended)

The easiest way to deploy this Next.js app is using
[Vercel](https://vercel.com):

1. **Push your code to GitHub**

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import your repository on Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   - Go to Project Settings → Environment Variables
   - Add all required environment variables (see above)
   - Use different values for Production, Preview, and Development

4. **Deploy!**
   - Vercel will automatically detect Next.js
   - Build command: `pnpm build` (or `npm run build`)
   - Output directory: `.next`
   - Framework preset: Next.js

5. **Configure MongoDB Atlas**
   - Add Vercel's IP addresses to MongoDB Atlas Network Access
   - Or allow access from anywhere (0.0.0.0/0) for development

### Other Platforms

This Next.js app can be deployed on any platform that supports Node.js:

- **Netlify**: Follow
  [Next.js deployment guide](https://docs.netlify.com/integrations/frameworks/next-js/)
- **Railway**: Connect GitHub repo and set environment variables
- **Render**: Use Node.js environment and set build command to `pnpm build`
- **Heroku**: Use Node.js buildpack and set build command

**Important**: Make sure to set all required environment variables in your
deployment platform.

### Post-Deployment

After deployment:

1. **Verify deployment**
   - Visit your live URL
   - Test authentication flow
   - Test API endpoints
   - Check database connection

2. **Monitor logs**
   - Check for any errors in deployment logs
   - Monitor API response times
   - Check database connection status

3. **Set up monitoring** (optional)
   - Configure error tracking (e.g., Sentry)
   - Set up uptime monitoring
   - Configure database backups

### Troubleshooting

**Build fails:**

- Check Node.js version (requires 18.x or higher)
- Verify all dependencies are installed
- Check for TypeScript errors (`pnpm build` locally)

**Database connection errors:**

- Verify MongoDB Atlas IP whitelist includes deployment platform IPs
- Check connection string format
- Verify database user credentials

**Authentication not working:**

- Verify JWT_SECRET is set correctly
- Check cookie settings (HTTP-only, secure, same-site)
- Verify token expiration settings

**API errors:**

- Check API routes are accessible
- Verify middleware is working correctly
- Check CORS settings if accessing from different domain

## 📖 Documentation

- [Development Progress](./docs/PROGRESS.md) - Detailed progress tracking
- [API Documentation](./docs/API.md) - Complete API reference
- [Testing Guide](./docs/TESTING.md) - Testing checklist and procedures
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
