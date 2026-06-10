import { motion } from 'framer-motion'

// Shared scroll-reveal wrapper (Framer Motion whileInView)
export default function Reveal({ children, delay = 0, y = 34, className, style, once = true }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
