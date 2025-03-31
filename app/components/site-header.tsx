import { useLocation } from "react-router"
import { Separator } from "~/components/ui/separator"
import { SidebarTrigger } from "~/components/ui/sidebar"

function formatPathname(pathname: string): string {
  // Special case for root path
  if (pathname === "/") {
    return "Dashboard";
  }
  
  // Split the path and filter out empty segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Handle the special case for "crossings" routes
  if (segments[0]?.toLowerCase() === "crossings" && segments.length > 1) {
    // Replace "crossings" with "crossing" (without the 's')
    segments[0] = "Crossing";
  }
  
  // Join segments with spaces and capitalize the first letter of the result
  return segments
    .join(' ')
    .replace(/^\w/, (c) => c.toUpperCase());
}

export function SiteHeader() {
  const location = useLocation();
  const formattedPathname = formatPathname(location.pathname);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{formattedPathname}</h1>
      </div>
    </header>
  )
}