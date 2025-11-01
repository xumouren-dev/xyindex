"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { StarfieldBackground } from "@/components/starfield-background"
import { ParticleName } from "@/components/particle-name"
import { ProfileSection } from "@/components/profile-section"

export default function HomePage() {
  const [isComplete, setIsComplete] = useState(false)
  const [showContent, setShowContent] = useState(false)

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden">
      <StarfieldBackground />

      <div className="relative min-h-screen w-full">
        <motion.div
          className="absolute inset-0 w-full h-screen flex items-center justify-center"
          initial={{ y: 0 }}
          animate={{
            y: isComplete ? "-20vh" : "0vh",
          }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (isComplete) {
              setShowContent(true)
            }
          }}
        >
          <div className="w-full h-full relative">
            <ParticleName onComplete={() => setIsComplete(true)} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, top: "50vh" }}
          animate={{
            opacity: showContent ? 1 : 0,
            top: showContent ? "48vh" : "50vh",
          }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute left-0 right-0"
        >
          <ProfileSection showContent={showContent} />
        </motion.div>
      </div>
    </div>
  )
}
