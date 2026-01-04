"use client";

import React, { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FeedbackModal from './FeedbackModal';

export default function FeedbackButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <motion.div
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
            >
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-lg hidden md:block"
                        >
                            의견 보내기
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors group"
                >
                    <MessageSquareText size={20} className="group-hover:text-primary transition-colors" />
                </motion.button>
            </motion.div>

            <AnimatePresence>
                {isOpen && <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />}
            </AnimatePresence>
        </>
    );
}
