const authService = require("../services/auth.service");

class AuthController {
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result });
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
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
