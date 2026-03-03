import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../api";

// Blog yazısına ait yorumları getir
export const fetchCommentsByBlog = createAsyncThunk(
    "comment/fetchByBlog",
    async (blogId, { rejectWithValue }) => {
        try {
            const res = await API.get(`/comments/blog/${blogId}`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Yorumlar getirilemedi");
        }
    }
);

// Yorum ekle (opsiyonel parentCommentId ile cevap desteği)
export const addComment = createAsyncThunk(
    "comment/add",
    async ({ blogId, content, parentCommentId }, { rejectWithValue }) => {
        try {
            const res = await API.post("/comments", { blogId, content, parentCommentId: parentCommentId || null });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Yorum eklenemedi");
        }
    }
);

// Bir yorumun cevaplarını getir
export const fetchReplies = createAsyncThunk(
    "comment/fetchReplies",
    async (commentId, { rejectWithValue }) => {
        try {
            const res = await API.get(`/comments/${commentId}/replies`);
            return { commentId, replies: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Cevaplar getirilemedi");
        }
    }
);

// Yorum güncelle
export const updateComment = createAsyncThunk(
    "comment/update",
    async ({ id, content }, { rejectWithValue }) => {
        try {
            const res = await API.put(`/comments/${id}`, { content });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Yorum güncellenemedi");
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
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Yorum silinemedi");
        }
    }
);

// Yorum beğen / beğeniyi geri al
export const likeComment = createAsyncThunk(
    "comment/like",
    async (commentId, { rejectWithValue }) => {
        try {
            const res = await API.put(`/comments/${commentId}/like`);
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Beğeni işlemi başarısız");
        }
    }
);

const commentSlice = createSlice({
    name: "comment",
    initialState: {
        comments: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch comments
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
            // Add comment (or reply)
            .addCase(addComment.fulfilled, (state, action) => {
                state.comments.unshift(action.payload);
            })
            // Fetch replies
            .addCase(fetchReplies.fulfilled, (state, action) => {
                // Replies are already part of all comments list, no separate storage needed
            })
            // Update comment
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.comments.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) state.comments[index] = action.payload;
            })
            // Delete comment
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter(
                    (c) => c._id !== action.payload && c.parentComment?._id !== action.payload && c.parentComment !== action.payload
                );
            })
            // Like comment
            .addCase(likeComment.fulfilled, (state, action) => {
                const index = state.comments.findIndex((c) => c._id === action.payload._id);
                if (index !== -1) {
                    state.comments[index].likes = action.payload.likes;
                    state.comments[index].likedBy = action.payload.likedBy;
                }
            });
    },
});

export default commentSlice.reducer;
