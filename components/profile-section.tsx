"use client"

import { motion } from "framer-motion"
import { Github } from "lucide-react"
import { TechIcons } from "./tech-icons"

const technologies = [
  { name: "React", Icon: TechIcons.React },
  { name: "Next.js", Icon: TechIcons["Next.js"] },
  { name: "Golang", Icon: TechIcons.Golang },
  { name: "Rust", Icon: TechIcons.Rust },
  { name: "Python", Icon: TechIcons.Python },
  { name: "Tauri2", Icon: TechIcons.Tauri2 },
]

interface ProfileSectionProps {
  showContent: boolean
}

export function ProfileSection({ showContent }: ProfileSectionProps) {
  return (
    <div className="relative z-20 flex flex-col items-center justify-center space-y-8 px-6">
      <motion.div
        className="text-center space-y-4 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-2xl md:text-3xl font-bold gradient-text leading-relaxed flex flex-col md:flex-row md:gap-2 items-center">
          <span>关山难越，谁悲失路之人</span>
          <span>萍水相逢，尽是他乡之客</span>
        </h2>
      </motion.div>

      <motion.div
        className="flex flex-wrap justify-center gap-2.5 max-w-3xl"
        initial={{ opacity: 0 }}
        animate={showContent ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        {technologies.map((tech, index) => (
          <motion.div
            key={tech.name}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={
              showContent
                ? { opacity: 1, scale: 1, y: 0 }
                : { opacity: 0, scale: 0.8, y: 10 }
            }
            transition={{
              duration: 0.35,
              delay: 0.3 + index * 0.06,
              ease: "easeOut",
            }}
            whileHover={{ scale: 1.05 }}
          >
            <tech.Icon />
            <span>{tech.name}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.a
        href="https://github.com/xumouren-dev"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full hover:bg-white/20 transition-all group"
        initial={{ opacity: 0, y: 20 }}
        animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.7, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
      >
        <Github className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
        <span className="text-white font-medium">GitHub</span>
      </motion.a>
    </div>
  )
}
