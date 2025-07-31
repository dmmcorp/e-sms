"use client"; // Error boundaries must be Client Components

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]  p-8 max-w-md mx-auto mt-10">
      <h2 className="text-red-700 mb-4 text-2xl font-semibold">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex content-between gap-x-5">
        <Button
          onClick={() => router.back()}
          className="bg-green-700 text-white rounded-md px-6 py-2 text-lg font-medium shadow-md transition"
        >
          Go back
        </Button>
        <Button
          onClick={() => reset()}
          className="bg-blue-700 text-white rounded-md px-6 py-2 text-lg font-medium shadow-md hover:bg-blue-800 transition"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
