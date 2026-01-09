'use client'

import React from 'react'

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Geometric grid pattern */}
      <div className="absolute inset-0 geometric-pattern opacity-50" />

      {/* Floating accent squares */}
      <div className="floating-square" />
      <div className="floating-square" />
      <div className="floating-square" />
      <div className="floating-square" />
    </div>
  )
}
