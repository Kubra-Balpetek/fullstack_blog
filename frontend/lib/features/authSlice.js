import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/lib/api";

// ---- Async Thunk'lar ----

// Kullanıcı kaydı
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const { data } = await API.post("/auth/register", userData);
            localStorage.setItem("token", data.token);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Kayıt başarısız"
            );
        }
    }
);

// Kullanıcı girişi
export const loginUser = createAsyncThunk(
    "auth/login",
    async (credentials, { rejectWithValue }) => {
        try {
            const { data } = await API.post("/auth/login", credentials);
            localStorage.setItem("token", data.token);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Giriş başarısız"
            );
        }
    }
);

// Profil bilgisi getir
export const getProfile = createAsyncThunk(
    "auth/getProfile",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get("/auth/profile");
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Profil getirilemedi"
            );
        }
    }
);

// ---- Slice ----

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: null,
        token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            localStorage.removeItem("token");
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Profile
            .addCase(getProfile.pending, (state) => {
                state.loading = true;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
