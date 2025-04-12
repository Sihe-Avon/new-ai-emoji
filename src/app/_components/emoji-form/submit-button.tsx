"use client"

import { experimental_useFormStatus as useFormStatus } from "react-dom"
import { forwardRef, type ComponentPropsWithoutRef } from "react"

export const SubmitButton = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<"button"> & { isGenerating?: boolean }
>(function SubmitButton(props, ref) {
  const { pending } = useFormStatus()
  const isLoading = pending || props.isGenerating

  return (
    <button
      {...props}
      ref={ref}
      type="submit"
      disabled={isLoading}
      className="rounded-lg text-xs font-medium px-2 py-1 bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 transition-all duration-300 h-8 mr-1"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </span>
      ) : (
        "Generate"
      )}
    </button>
  )
})