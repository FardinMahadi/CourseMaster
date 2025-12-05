'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  FileText,
  BarChart3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { useAuth } from '@/hooks/useAuth';

import { ThemeToggle } from './theme-toggle';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, loading, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              CourseMaster
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Courses
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <Link
                  href="/admin/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/courses"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Manage Courses
                </Link>
                <Link
                  href="/admin/analytics"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Analytics
                </Link>
              </>
            )}
          </div>

          {/* Desktop Auth & Theme */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative size-9 rounded-full">
                    <User className="size-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' ? (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center">
                          <LayoutDashboard className="mr-2 size-4" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/courses" className="flex items-center">
                          <BookOpen className="mr-2 size-4" />
                          Manage Courses
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/batches" className="flex items-center">
                          <GraduationCap className="mr-2 size-4" />
                          Batches
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/enrollments" className="flex items-center">
                          <Users className="mr-2 size-4" />
                          Enrollments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/assignments" className="flex items-center">
                          <FileText className="mr-2 size-4" />
                          Assignments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/analytics" className="flex items-center">
                          <BarChart3 className="mr-2 size-4" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <LayoutDashboard className="mr-2 size-4" />
                        Student Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              className="size-9"
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="flex flex-col space-y-4 px-4 py-4">
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/courses"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/courses"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage Courses
                  </Link>
                  <Link
                    href="/admin/analytics"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Analytics
                  </Link>
                </>
              )}
              <div className="flex flex-col space-y-2 pt-2">
                {loading ? (
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                ) : isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    {user.role === 'admin' ? (
                      <>
                        <Button asChild variant="ghost" className="justify-start">
                          <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                            <LayoutDashboard className="mr-2 size-4" />
                            Admin Dashboard
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start">
                          <Link href="/admin/courses" onClick={() => setMobileMenuOpen(false)}>
                            <BookOpen className="mr-2 size-4" />
                            Manage Courses
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start">
                          <Link href="/admin/batches" onClick={() => setMobileMenuOpen(false)}>
                            <GraduationCap className="mr-2 size-4" />
                            Batches
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start">
                          <Link href="/admin/enrollments" onClick={() => setMobileMenuOpen(false)}>
                            <Users className="mr-2 size-4" />
                            Enrollments
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start">
                          <Link href="/admin/assignments" onClick={() => setMobileMenuOpen(false)}>
                            <FileText className="mr-2 size-4" />
                            Assignments
                          </Link>
                        </Button>
                        <Button asChild variant="ghost" className="justify-start">
                          <Link href="/admin/analytics" onClick={() => setMobileMenuOpen(false)}>
                            <BarChart3 className="mr-2 size-4" />
                            Analytics
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <Button asChild variant="ghost" className="justify-start">
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <LayoutDashboard className="mr-2 size-4" />
                          Student Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start text-destructive"
                      onClick={() => {
                        handleLogout();
                      }}
                    >
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button asChild className="justify-start">
                      <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                        Register
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
