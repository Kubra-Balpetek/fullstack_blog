"use client";

import { motion } from "framer-motion";

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center py-20">
            <motion.div
                className="w-12 h-12 rounded-full border-4 border-primary-600/30 border-t-primary-500"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}
