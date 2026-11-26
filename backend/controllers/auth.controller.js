const authService = require("../services/auth.service");
const { extractRefreshToken } = require("../middlewares/authentication");
const AppError = require("../services/utils/appError");
const {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions
} = require("../utils/jwt");

function clearAccessToken(res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, getAccessTokenCookieOptions());
}

function clearRefreshToken(res) {
  res.clearCookie(REFRESH_TOKEN_COOKIE, getRefreshTokenCookieOptions());
}

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ success: true, data: { user } });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      res.cookie(ACCESS_TOKEN_COOKIE, result.token, getAccessTokenCookieOptions());

      if (result.refreshToken) {
        res.cookie(
          REFRESH_TOKEN_COOKIE,
          result.refreshToken,
          getRefreshTokenCookieOptions()
        );
      } else {
        // Por si quedó una cookie de refresh de una sesión anterior.
        clearRefreshToken(res);
      }

      res.json({ success: true, data: { user: result.user } });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    const refreshToken = extractRefreshToken(req);

    if (!refreshToken) {
      clearAccessToken(res);
      clearRefreshToken(res);
      return next(
        new AppError("No hay una sesión que renovar.", 401, "UNAUTHORIZED")
      );
    }

    try {
      const result = await authService.refresh(refreshToken);

      res.cookie(ACCESS_TOKEN_COOKIE, result.token, getAccessTokenCookieOptions());
      res.json({ success: true, data: { user: result.user } });
    } catch (error) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        clearAccessToken(res);
        clearRefreshToken(res);
      }
      next(error);
    }
  }

  async renew(req, res, next) {
    try {
      const result = await authService.renewAccess({
        userId: req.user.id,
        tokenHash: req.auth.tokenHash
      });

      res.cookie(ACCESS_TOKEN_COOKIE, result.token, getAccessTokenCookieOptions());
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const isClient = req.user.role === "Client";

      await authService.logout({
        tokenHash: req.auth.tokenHash,
        userId: req.user.id,
        refreshToken: isClient ? extractRefreshToken(req) : null
      });

      clearAccessToken(res);
      if (isClient) clearRefreshToken(res);

      res.json({
        success: true,
        message: "Sesión cerrada correctamente."
      });
    } catch (error) {
      next(error);
    }
  }

  me(req, res) {
    const { id, ...user } = req.user;
    res.json({
      success: true,
      data: { user: { _id: id, ...user } }
    });
  }
}

module.exports = new AuthController();
