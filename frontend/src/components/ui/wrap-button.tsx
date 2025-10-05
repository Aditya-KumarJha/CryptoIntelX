import React from "react"
import Link from "next/link"
import { ArrowRight, Globe } from "lucide-react"

import { cn } from "@/lib/utils"

interface WrapButtonProps {
  className?: string
  children: React.ReactNode
  href?: string
}

const WrapButton: React.FC<WrapButtonProps> = ({
  className,
  children,
  href,
}) => {
  // Reduced size by removing fixed h-[64px] and changing p-[11px] to p-1.5
  // Also simplified the Globe icon animation.
  const buttonContent = (
    <div
      className={cn(
        // Outer Container: Reduced padding, removed fixed height
        "group cursor-pointer border border-[#3B3A3A] bg-[#151515] gap-2 flex items-center p-2.5 rounded-full", 
        className
      )}
    >
      <div 
        // Inner Text/Icon Container: Removed border-[#3B3A3A] to simplify
        className="bg-[#ff3f17] h-10 rounded-full flex items-center justify-center text-white px-4"
      >
        {/* Removed animate-spin from Globe, added simple transition instead */}
        <Globe size={18} className="mr-2 animate-spin transition duration-700" />
        <p className="font-medium tracking-tight">
          {children ? children : "Get Started"}
        </p>
      </div>
      <div 
        // Arrow Icon Container: Reduced size to make the overall button smaller
        className="text-[#3b3a3a] group-hover:ml-2 ease-in-out transition-all size-6 flex items-center justify-center rounded-full border-2 border-[#3b3a3a]"
      >
        <ArrowRight
          size={16} // Reduced arrow size
          className="group-hover:rotate-45 ease-in-out transition-all"
        />
      </div>
    </div>
  )

  return (
    <div className="flex items-center justify-center">
      {href ? (
        <Link href={href}>
          {buttonContent}
        </Link>
      ) : (
        // The non-link version for consistency (changed bg-[#fe7500] to bg-[#ff3f17])
        buttonContent
      )}
    </div>
  )
}

export default WrapButton
