const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateTokens } = require("../utils/tokenUtils");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({
          success: false,
          error: { message: "Email already in use", code: "DUPLICATE_EMAIL" },
        });
    }

    // Password validation: min 8 chars, 1 uppercase, 1 number
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            message:
              "Password must be at least 8 characters long, contain 1 uppercase letter, and 1 number.",
            code: "WEAK_PASSWORD",
          },
        });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default role to donor if not provided or invalid
    const validRole = ["donor", "creator"].includes(role) ? role : "donor";

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: validRole,
    });

    const { accessToken, refreshToken } = generateTokens(user);

    // Save hash of refresh token in DB
    const refreshSalt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, refreshSalt);
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          error: {
            message: "Please provide email and password",
            code: "BAD_REQUEST",
          },
        });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          error: { message: "Invalid email or password", code: "UNAUTHORIZED" },
        });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res
        .status(401)
        .json({
          success: false,
          error: { message: "Invalid email or password", code: "UNAUTHORIZED" },
        });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    const refreshSalt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(refreshToken, refreshSalt);
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res
        .status(401)
        .json({
          success: false,
          error: { message: "Unauthorized", code: "UNAUTHORIZED" },
        });
    }
    const refreshToken = cookies.jwt;

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || !user.refreshToken) {
      return res
        .status(403)
        .json({
          success: false,
          error: { message: "Forbidden", code: "FORBIDDEN" },
        });
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) {
      return res
        .status(403)
        .json({
          success: false,
          error: { message: "Forbidden", code: "FORBIDDEN" },
        });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    const refreshSalt = await bcrypt.genSalt(10);
    user.refreshToken = await bcrypt.hash(newRefreshToken, refreshSalt);
    await user.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(403)
        .json({
          success: false,
          error: { message: "Refresh token expired", code: "FORBIDDEN" },
        });
    }
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    } catch (e) {
      // Ignore if token is already expired/invalid during logout
    }

    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "None",
      secure: process.env.NODE_ENV === "production",
    });
    res
      .status(200)
      .json({ success: true, data: { message: "Logged out successfully" } });
  } catch (error) {
    next(error);
  }
};
