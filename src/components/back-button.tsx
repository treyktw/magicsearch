"use client"

import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { ChevronLeft } from "lucide-react";


export const BackButton= () => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} variant="secondary" className="flex gap-2 items-center text-sm pb-2">
      <ChevronLeft className="h-4 w-4" />
      Back
    </Button>
  )
}
