import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, setAuthToken } from "../../lib/api";

const STORAGE_KEY = "delta_auth";

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return { user: parsed.user || null, token: parsed.token || null };
  } catch {
    return { user: null, token: null };
  }
}

function saveAuth(user, token) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}

const initial = loadAuth();
setAuthToken(initial.token);

export const login = createAsyncThunk("auth/login", async ({ email, password }) => {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data;
});

export const register = createAsyncThunk("auth/register", async ({ name, email, password }) => {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data;
});

export const fetchMe = createAsyncThunk("auth/me", async () => {
  const { data } = await api.get("/api/auth/me");
  return data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: initial.user,
    token: initial.token,
    status: "idle",
    error: null
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
      setAuthToken(null);
    }
  },
  extraReducers: (builder) => {
    const fulfilled = (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "succeeded";
      state.error = null;
      saveAuth(state.user, state.token);
      setAuthToken(state.token);
    };

    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Erreur login";
      })
      .addCase(register.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error?.message || "Erreur inscription";
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.error = null;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

