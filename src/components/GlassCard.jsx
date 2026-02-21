import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const GlassCard = ({ children, className, delay = 0, hover = true, padding = true }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className={cn(
                "glass-card overflow-hidden",
                hover && "glass-card-hover",
                padding && "p-6",
                className
            )}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
