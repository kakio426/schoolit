import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingRobotButtonProps {
    onClick: () => void;
}

export default function FloatingRobotButton({ onClick }: FloatingRobotButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    // Initial greeting animation on mount
    const [showGreeting, setShowGreeting] = useState(true);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {(isHovered || showGreeting) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        onAnimationComplete={() => {
                            // Hide greeting after 5 seconds if not hovered
                            if (showGreeting) {
                                setTimeout(() => setShowGreeting(false), 5000);
                            }
                        }}
                        className="bg-white dark:bg-zinc-800 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-700 mb-2 relative mr-2"
                    >
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                            무엇을 도와드릴까요? 🤖
                        </span>
                        {/* Triangle for speech bubble */}
                        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white dark:bg-zinc-800 transform rotate-45 border-r border-b border-slate-100 dark:border-zinc-700"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={onClick}
                className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white relative group border-4 border-white dark:border-zinc-950"
            >
                <Bot size={32} className="group-hover:rotate-12 transition-transform" />
            </motion.button>
        </div>
    );
}
