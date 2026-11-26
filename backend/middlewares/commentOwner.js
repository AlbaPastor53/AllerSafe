const AppError = require("../services/utils/appError");
const commentRepository = require("../repository/comment.repository");

async function commentOwner(req, res, next) {
  try {
    const comment = await commentRepository.findById(req.params.id);

    if (!comment) {
      throw new AppError("Comentario no encontrado.", 404, "COMMENT_NOT_FOUND");
    }

    const isAdmin = req.user.role === "Admin";
    const isOwner = String(comment.user_id) === req.user.id;

    if (!isAdmin && !isOwner) {
      throw new AppError(
        "Solo puedes modificar tus propios comentarios.",
        403,
        "FORBIDDEN"
      );
    }

    req.comment = comment;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = commentOwner;
