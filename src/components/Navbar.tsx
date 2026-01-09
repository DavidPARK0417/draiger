"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-6 mix-blend-difference"
    >
      <Link
        href="/"
        className="text-2xl font-serif tracking-tighter text-white"
      >
        DRAIGER
      </Link>

      <div className="flex gap-8 items-center">
        <Link
          href="/"
          className="text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors"
        >
          Index
        </Link>
        <Link
          href="/contact"
          className="text-sm uppercase tracking-widest text-white/70 hover:text-white transition-colors"
        >
          Contact
        </Link>
      </div>
    </motion.nav>
  );
}

