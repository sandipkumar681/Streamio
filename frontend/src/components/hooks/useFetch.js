import { useEffect, useState } from "react";

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const json = await backendCaller(url);
      setIsLoading(false);

      if (json.success) {
        setData(json.data);
      } else {
        setMessage("Failed to fetch video");
      }
    };

    fetchData();
  }, [url]);

  return { data, isLoading, message };
};
