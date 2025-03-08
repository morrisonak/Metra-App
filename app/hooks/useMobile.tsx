import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Initialize
    checkMobile();
    
    // Set up event listener
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    if (mql.addEventListener) {
      mql.addEventListener("change", checkMobile);
    } else {
      // For older browsers
      window.addEventListener("resize", checkMobile);
    }
    
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", checkMobile);
      } else {
        window.removeEventListener("resize", checkMobile);
      }
    };
  }, []);

  return !!isMobile;
}