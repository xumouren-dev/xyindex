"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { StarfieldBackground } from "@/components/starfield-background"
import { ParticleName } from "@/components/particle-name"
import { ProfileSection } from "@/components/profile-section"

export default function HomePage() {
  const [isComplete, setIsComplete] = useState(false)

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden">
      <StarfieldBackground />

      <div className="relative min-h-screen w-full">
        <motion.div
          className="absolute inset-0 w-full h-screen flex items-center justify-center"
          initial={{ y: 0 }}
          animate={{
            y: isComplete ? "-25vh" : "0vh",
          }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <div className="w-full h-full relative">
            <ParticleName onComplete={() => setIsComplete(true)} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: isComplete ? 1 : 0,
            y: isComplete ? 0 : 30,
          }}
          transition={{ duration: 1, delay: isComplete ? 0.8 : 0 }}
          className="absolute bottom-0 left-0 right-0"
        >
          <ProfileSection />
        </motion.div>
      </div>
    </div>
  )
}
