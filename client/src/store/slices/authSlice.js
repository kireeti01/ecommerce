import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: null, // Kept strictly in memory, never in localStorage
  isAuthenticated: false,
  loading: true, // True on app mount while checking silent session refresh
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

export const {
  setCredentials,
  updateAccessToken,
  updateUserProfile,
  logout,
  setLoading,
  setError
} = authSlice.actions;

export default authSlice.reducer;
