// src/components/LoadingSpinner.jsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-10 w-full bg-gray-200" />
      <Skeleton className="h-64 w-full bg-gray-200" />
    </div>
  );
}