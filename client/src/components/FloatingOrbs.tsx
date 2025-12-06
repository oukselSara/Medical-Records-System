import { motion } from "framer-motion";

export function FloatingOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(249, 168, 212, 0.05) 70%, transparent 100%)",
          filter: "blur(60px)",
          top: "-10%",
          right: "-5%",
        }}
        animate={{
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(249, 168, 212, 0.2) 0%, rgba(252, 231, 243, 0.05) 70%, transparent 100%)",
          filter: "blur(50px)",
          bottom: "10%",
          left: "-5%",
        }}
        animate={{
          x: [0, -25, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(255, 241, 242, 0.05) 70%, transparent 100%)",
          filter: "blur(40px)",
          top: "40%",
          left: "30%",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute w-72 h-72 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(249, 168, 212, 0.12) 0%, transparent 70%)",
          filter: "blur(45px)",
          bottom: "30%",
          right: "20%",
        }}
        animate={{
          x: [0, -20, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
