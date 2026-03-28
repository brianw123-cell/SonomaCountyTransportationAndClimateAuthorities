export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-[#8ccacf]/30 border-t-[#8ccacf] rounded-full animate-spin" />
        <p className="mt-4 text-sm text-[#313131]/60 font-medium">Loading...</p>
      </div>
    </div>
  )
}
