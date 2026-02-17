import { useState, useEffect } from "react";

/**
 * Hook that maintains current time and updates every minute
 */
export const useCurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return currentTime;
};
