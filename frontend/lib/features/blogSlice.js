import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/lib/api";

// ---- Async Thunk'lar ----

// Tüm blogları getir
export const fetchBlogs = createAsyncThunk(
    "blog/fetchBlogs",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get("/blogs");
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Bloglar getirilemedi"
            );
        }
    }
);

// Tek blog detayı getir
export const fetchBlogById = createAsyncThunk(
    "blog/fetchBlogById",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`/blogs/${id}`);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Blog detayı getirilemedi"
            );
        }
    }
);

// Yeni blog oluştur
export const createBlog = createAsyncThunk(
    "blog/createBlog",
    async (blogData, { rejectWithValue }) => {
        try {
            const { data } = await API.post("/blogs", blogData);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Blog oluşturulamadı"
            );
        }
    }
);

// Blog güncelle
export const updateBlog = createAsyncThunk(
    "blog/updateBlog",
    async ({ id, blogData }, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/blogs/${id}`, blogData);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Blog güncellenemedi"
            );
        }
    }
);

// Blog sil
export const deleteBlog = createAsyncThunk(
    "blog/deleteBlog",
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/blogs/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Blog silinemedi"
            );
        }
    }
);

// Blog beğen
export const likeBlog = createAsyncThunk(
    "blog/likeBlog",
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/blogs/${id}/like`);
            return { id, likes: data.likes };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Beğeni işlemi başarısız"
            );
        }
    }
);

// ---- Slice ----

const blogSlice = createSlice({
    name: "blog",
    initialState: {
        blogs: [],
        currentBlog: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        },
        clearBlogError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchBlogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogs.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = action.payload;
            })
            .addCase(fetchBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch By Id
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBlog = action.payload;
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createBlog.fulfilled, (state, action) => {
                state.blogs.unshift(action.payload);
            })
            // Update
            .addCase(updateBlog.fulfilled, (state, action) => {
                const index = state.blogs.findIndex(
                    (b) => b._id === action.payload._id
                );
                if (index !== -1) state.blogs[index] = action.payload;
                if (state.currentBlog?._id === action.payload._id) {
                    state.currentBlog = action.payload;
                }
            })
            // Delete
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.blogs = state.blogs.filter((b) => b._id !== action.payload);
            })
            // Like
            .addCase(likeBlog.fulfilled, (state, action) => {
                const blog = state.blogs.find((b) => b._id === action.payload.id);
                if (blog) blog.likes = action.payload.likes;
                if (state.currentBlog?._id === action.payload.id) {
                    state.currentBlog.likes = action.payload.likes;
                }
            });
    },
});

export const { clearCurrentBlog, clearBlogError } = blogSlice.actions;
export default blogSlice.reducer;
