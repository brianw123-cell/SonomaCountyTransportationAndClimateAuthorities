"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md px-4">
        <div className="text-5xl font-bold text-[#e75425] mb-4">Oops</div>
        <h2 className="text-xl font-semibold text-[#313131] mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-[#313131]/60 mb-6">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="bg-[#8ccacf] text-white px-6 py-2 rounded-md hover:bg-[#7ab8bd] transition-colors text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
