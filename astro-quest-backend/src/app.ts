// import express from "express";
// import chatRoutes from "./chat/chat.routes";
// import onboardingRoutes from "./routes/onboarding.routes";

// const app = express();

// // middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // routes
// app.use("/api/chat", chatRoutes);

// // 🔥 ADD THIS LINE (VERY IMPORTANT)
// app.use("/api", onboardingRoutes);

// export default app;

import express from "express";
import chatRoutes from "./chat/chat.routes";
import onboardingRoutes from "./routes/onboarding.routes";



const app = express();

app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api", onboardingRoutes);



export default app;

