// src/hooks/useLiveData.js
import { useQuery } from "@tanstack/react-query";
import { fetchLiveData } from "../lib/api";

export const useLiveData = () => {
  return useQuery({
    queryKey: ["liveData"],
    queryFn: fetchLiveData,
    refetchInterval: 1000, // Polling cada 1 segundo
    staleTime: 0, // Los datos siempre se consideran "frescos"
  });
};