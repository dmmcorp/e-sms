import { Loader2 } from "lucide-react";

export function Loader() {
  return (
    <div className="flex flex-col items-center gap-3 text-muted-foreground">
      <Loader2 className="w-5 h-5 animate-spin" />
      <h1>Loading content...</h1>
    </div>
  );
}
