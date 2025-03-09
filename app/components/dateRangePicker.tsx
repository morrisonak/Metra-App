import { useState } from "react";
import { Calendar, ChevronsUpDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { cn } from "~/lib/utils";

export function DateRangePicker() {
  const [date, setDate] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(2023, 0, 1),
    to: new Date(),
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from)} - {format(date.to)}
              </>
            ) : (
              format(date.from)
            )
          ) : (
            <span>Pick a date range</span>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        {/* This would normally include a calendar date picker */}
        <div className="p-3">Date picker UI would go here</div>
      </PopoverContent>
    </Popover>
  );
}

// Helper function to format dates
function format(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}