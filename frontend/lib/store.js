import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import blogReducer from "./features/blogSlice";
import commentReducer from "./features/commentSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        blog: blogReducer,
        comment: commentReducer,
    },
});
