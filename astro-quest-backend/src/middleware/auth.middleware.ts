import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Session from "../session/session.model"; // ✅ ADDED

// export interface AuthRequest extends Request {
//   user?: {
//     userId: string;
//     email: string;
//     sessionId: string; // ✅ ADDED
//   };
// }

export const authMiddleware = async ( // ✅ async added (required)
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string;
      email: string;
      sessionId: string; // ✅ ADDED
    };

    // 🔐 SESSION CHECK (ONLY NEW LOGIC)
    const session = await Session.findOne({
      _id: decoded.sessionId,
      userId: decoded.userId,
      isActive: true,
    });

    if (!session) {
      return res
        .status(401)
        .json({ message: "Session expired. Please login again." });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
