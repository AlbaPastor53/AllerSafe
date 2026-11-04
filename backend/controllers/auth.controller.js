const authService = require("../services/auth.service");
const {
  ACCESS_TOKEN_COOKIE,
  getAccessTokenCookieOptions
} = require("../utils/jwt");

class AuthController {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.cookie(ACCESS_TOKEN_COOKIE, result.token, {
        ...getAccessTokenCookieOptions(),
        expires: result.expiresAt
      });
      res.json({ success: true, data: { user: result.user } });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout({
        tokenHash: req.auth.tokenHash,
        userId: req.user.id,
        exp: req.auth.exp
      });
      res.clearCookie(ACCESS_TOKEN_COOKIE, getAccessTokenCookieOptions());
      res.status(204).end();
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
