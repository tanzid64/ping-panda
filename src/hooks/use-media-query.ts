import { useEffect, useState } from "react";

export const useMediaQuery = () => {
  const [device, setDevice] = useState<"mobile" | "tablet" | "desktop" | null>(
    null
  );

  const [dimentions, setDimentions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const checkDevice = () => {
      if (window.matchMedia("(max-width: 640px)").matches) {
        setDevice("mobile");
      } else if (
        window.matchMedia("(min-width: 641px) and (max-width: 1024px)").matches
      ) {
        setDevice("tablet");
      } else {
        setDevice("desktop");
      }
    };

    checkDevice();

    window.addEventListener("resize", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
    };
  }, []);

  return {
    device,
    width: dimentions?.width,
    height: dimentions?.height,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
  };
};
