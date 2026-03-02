import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/lib/api";

// ---- Async Thunk'lar ----

// Blog'a ait yorumları getir
export const fetchCommentsByBlog = createAsyncThunk(
    "comment/fetchByBlog",
    async (blogId, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`/comments/blog/${blogId}`);
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Yorumlar getirilemedi"
            );
        }
    }
);

// Yorum ekle
export const addComment = createAsyncThunk(
    "comment/add",
    async ({ blogId, content }, { rejectWithValue }) => {
        try {
            const { data } = await API.post("/comments", { blogId, content });
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Yorum eklenemedi"
            );
        }
    }
);

// Yorum güncelle
export const updateComment = createAsyncThunk(
    "comment/update",
    async ({ id, content }, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/comments/${id}`, { content });
            return data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Yorum güncellenemedi"
            );
        }
    }
);

// Yorum sil
export const deleteComment = createAsyncThunk(
    "comment/delete",
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/comments/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Yorum silinemedi"
            );
        }
    }
);

// ---- Slice ----

const commentSlice = createSlice({
    name: "comment",
    initialState: {
        comments: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearComments: (state) => {
            state.comments = [];
        },
        clearCommentError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch by Blog
            .addCase(fetchCommentsByBlog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCommentsByBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(fetchCommentsByBlog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Add
            .addCase(addComment.fulfilled, (state, action) => {
                state.comments.unshift(action.payload);
            })
            // Update
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.comments.findIndex(
                    (c) => c._id === action.payload._id
                );
                if (index !== -1) state.comments[index] = action.payload;
            })
            // Delete
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter((c) => c._id !== action.payload);
            });
    },
});

export const { clearComments, clearCommentError } = commentSlice.actions;
export default commentSlice.reducer;
