"use client"
import { motion } from 'framer-motion'

export function Welcome() {
  return (
    <section className="px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:.6}}
          className="text-2xl md:text-3xl text-pastel-blue">
          Olá, como você está, Hadassah?
        </motion.div>
      </div>
    </section>
  )
}
