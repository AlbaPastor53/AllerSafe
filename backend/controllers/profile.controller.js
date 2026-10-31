const profileService = require("../services/profile.service");

class ProfileController {
  async get(req, res, next) {
    try {
      const profile = await profileService.getByUserId(req.user.id);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const profile = await profileService.updateForUser(req.user.id, req.body);
      res.json({ success: true, data: profile });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProfileController();
