import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://192.168.1.2:5050";

export const logoutUser = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");

    if (token) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.log("Logout API error:", error);
  } finally {
    // 🔥 Clear frontend session data
    await AsyncStorage.multiRemove([
      "authToken",
      "hasOnboarded",
      "userName",
      "birthDate",
      "birthTime",
      "birthPlace",
      "selectedGuideId",
      "userProfile", // 🔥 ADD THIS For Profile
    ]);
  }
};
