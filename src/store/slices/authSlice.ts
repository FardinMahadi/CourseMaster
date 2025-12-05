import type { PayloadAction } from '@reduxjs/toolkit';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserWithoutPassword,
} from '@/types/user.types';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { adminLogin, getCurrentUser, login, logout, register } from '@/lib/api/services';

interface AuthState {
  user: UserWithoutPassword | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean; // Track if initial auth check has been done
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
};

// Async thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials: LoginInput) => {
  const response = await login(credentials);
  return response;
});

export const registerUser = createAsyncThunk('auth/register', async (userData: RegisterInput) => {
  const response = await register(userData);
  return response;
});

export const adminLoginUser = createAsyncThunk(
  'auth/adminLogin',
  async (credentials: { email: string; password: string; adminSecretKey: string }) => {
    const response = await adminLogin(credentials);
    return response;
  }
);

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  const user = await getCurrentUser();
  return user;
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserWithoutPassword>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    clearUser: state => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: state => {
      state.error = null;
    },
    setInitialized: state => {
      state.initialized = true;
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true; // Mark as initialized after successful login
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
      });

    // Register
    builder
      .addCase(registerUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true; // Mark as initialized after successful registration
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
        state.isAuthenticated = false;
      });

    // Admin Login
    builder
      .addCase(adminLoginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLoginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialized = true; // Mark as initialized after successful admin login
        state.error = null;
      })
      .addCase(adminLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Admin login failed';
        state.isAuthenticated = false;
      });

    // Fetch Current User
    builder
      .addCase(fetchCurrentUser.pending, state => {
        state.loading = true;
        state.initialized = true; // Mark as initialized immediately to prevent duplicate requests
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserWithoutPassword>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.initialized = true; // Mark as initialized even on failure to prevent infinite loop
        // Don't set error for fetchCurrentUser rejection (user might not be logged in)
      });

    // Logout
    builder
      .addCase(logoutUser.pending, state => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, state => {
        state.loading = false;
        // Even if logout fails, clear local state
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { setUser, clearUser, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;
