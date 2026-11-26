const Comment = require("../models/comment.model");

class CommentRepository {
  async findById(id) {
    return Comment.findById(id);
  }

  async findByEventId(eventId, { activeOnly = true } = {}) {
    const filter = { event_id: eventId };
    if (activeOnly) filter.isActive = true;

    return Comment.find(filter).sort({ created_at: -1, _id: -1 });
  }

  async create(data) {
    return Comment.create(data);
  }

  async updateById(id, data) {
    return Comment.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async setActive(id, isActive) {
    return Comment.findByIdAndUpdate(id, { isActive }, { new: true });
  }
}

module.exports = new CommentRepository();
