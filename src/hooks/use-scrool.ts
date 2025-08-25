import { is } from "date-fns/locale";
import { useEffect, useState } from "react";

export const useScrool = (threshold = 10) => {
  const [isScrooled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScrool = () => {
      setIsScrolled(window.scrollY > threshold);
    };
    window.addEventListener("scroll", handleScrool);
    handleScrool();
    return () => window.removeEventListener("scroll", handleScrool);
  }, [threshold]);
  return isScrooled
};
