import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-[#8ccacf]">404</h2>
        <p className="mt-2 text-xl font-semibold text-[#313131]">
          Page Not Found
        </p>
        <p className="mt-2 text-gray-500 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-4 w-16 h-[2px] bg-[#f3d597] mx-auto" />
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-2.5 bg-[#8ccacf] text-white font-medium rounded-md hover:bg-[#7ab8bd] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
