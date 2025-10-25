"use client"
import { motion } from 'framer-motion'

export function Header() {
  return (
    <header className="pt-16 pb-8 px-6">
      <div className="max-w-5xl mx-auto glass p-6">
        <motion.h1 initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} transition={{duration:.5}}
          className="text-3xl md:text-4xl text-pop">Hadassah • Memórias</motion.h1>
        <p className="opacity-80 mt-1">Um cantinho minimalista para guardar nossas memórias.</p>
      </div>
    </header>
  )
}
