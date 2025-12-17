import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ALL_GUIDES, Guide } from "../data/guides";

export function useSelectedGuide() {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("selectedGuide");
        if (saved) {
          const { id } = JSON.parse(saved);
          const fullGuide = ALL_GUIDES.find(g => g.id === id) || null;
          setGuide(fullGuide);
        }
      } catch (e) {
        console.log("Failed to load guide:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { guide, loading };
}
