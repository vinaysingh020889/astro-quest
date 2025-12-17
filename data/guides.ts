import { ImageSourcePropType } from "react-native";

export type Guide = {
  id?: string;
  name: string;
  role: string;
  image: ImageSourcePropType;
  rating?: number;
  sessions?: number;
};

export const ALL_GUIDES: Guide[] = [
 { id: "1", name: "Orion Luminar", role: "Cosmic Healer", image: require("../assets/images/guides/guide1-lady-Asian.jpg"), rating: 4.9, sessions: 1200 },
  { id: "2", name: "Lyra Nova", role: "Mind Alignment", image: require("../assets/images/guides/guide2-lady-Asian.jpg"), rating: 4.8, sessions: 980 },
  { id: "3", name: "Seren Astra", role: "Spiritual Energy", image: require("../assets/images/guides/guide3-Male-Asian.jpg"), rating: 5.0, sessions: 1450 },
  { id: "4", name: "Caelum Orionis", role: "Astro Meditation", image: require("../assets/images/guides/guide4-Male-Asian.jpg"), rating: 4.7, sessions: 860 },
  { id: "5", name: "Nova Zenith", role: "Aura Cleansing", image: require("../assets/images/guides/guide5-female-Asian.jpg"), rating: 4.9, sessions: 1012 },
  { id: "6", name: "Altair Solace", role: "Celestial Energy", image: require("../assets/images/guides/guide6-male-Asian.jpg"), rating: 4.8, sessions: 790 },
  { id: "7", name: "Vega Lumen", role: "Mind Alignment", image: require("../assets/images/guides/guide7-female-Asian.jpg"), rating: 4.9, sessions: 1100 },
  { id: "8", name: "Astra Nyx", role: "Spiritual Energy", image: require("../assets/images/guides/guide8-male-Asian.jpg"), rating: 4.7, sessions: 660 },
  { id: "9", name: "Rigel Dawn", role: "Cosmic Healer", image: require("../assets/images/guides/guide9-female-Asian.jpg"), rating: 4.8, sessions: 905 },
  { id: "10", name: "Selene Quill", role: "Astro Meditation", image: require("../assets/images/guides/guide10-female-Asian.jpg"), rating: 4.1, sessions: 330 },
  { id: "11", name: "Selene Quill", role: "Mind Alignment", image: require("../assets/images/guides/guide11-male-Asian.jpg"), rating: 4.4, sessions: 1130 },
  { id: "12", name: "Selene Quill", role: "Cosmic Healer", image: require("../assets/images/guides/guide12-male-Asian.jpg"), rating: 4.2, sessions: 430 },
  { id: "13", name: "Selene Quill", role: "Celestial Energy", image: require("../assets/images/guides/guide13-male-Asian.jpg"), rating: 4.1, sessions: 230 },
  { id: "14", name: "Selene Quill", role: "Astro Meditation", image: require("../assets/images/guides/guide14-female-Asian.jpg"), rating: 4.6, sessions: 130 },
  { id: "15", name: "Selene Quill", role: "Spiritual Energy", image: require("../assets/images/guides/guide15-female-Asian.jpg"), rating: 4.9, sessions: 133 },
  { id: "16", name: "Selene Quill", role: "Astro Meditation", image: require("../assets/images/guides/guide16-male-Asian.jpg"), rating: 4.7, sessions: 233 },
  { id: "17", name: "Selene Quill", role: "Aura Cleansing", image: require("../assets/images/guides/guide17-male-Asian.jpg"), rating: 3.9, sessions: 328 },
  { id: "18", name: "Selene Quill", role: "Cosmic Healer", image: require("../assets/images/guides/guide18-male-Asian.jpg"), rating: 3.8, sessions: 926 },
  { id: "19", name: "Selene Quill", role: "Astro Meditation", image: require("../assets/images/guides/guide19-male-Asian.jpg"), rating: 4.0, sessions: 120 },
  { id: "20", name: "Selene Quill", role: "Celestial Energy", image: require("../assets/images/guides/guide20-female-Asian.jpg"), rating: 4.9, sessions: 745 },
];
