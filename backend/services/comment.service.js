const commentRepository = require("../repository/comment.repository");
const eventRepository = require("../repository/event.repository");
const iaService = require("./ia.service");
const AppError = require("./utils/appError");

const USER_POPULATE = { path: "user_id", select: "name role" };
const SENTIMENTS = ["Positivo", "Neutral", "Negativo"];

function round(value) {
  return Math.round(value * 10) / 10;
}

function percentage(count, total) {
  return total > 0 ? round((count * 100) / total) : 0;
}

class CommentService {
  async assertEvent(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) {
      throw new AppError("Experiencia no encontrada.", 404, "EVENT_NOT_FOUND");
    }
  }

  async populateUser(comment) {
    await comment.populate(USER_POPULATE);
    return comment;
  }

  async create(userId, data) {
    await this.assertEvent(data.event_id);

    const comment = await commentRepository.create({ ...data, user_id: userId });
    return this.populateUser(comment);
  }

  async listByEvent(eventId) {
    const comments = await commentRepository.findByEventId(eventId, {
      activeOnly: true
    });

    return Promise.all(comments.map((comment) => this.populateUser(comment)));
  }

  async getById(id) {
    const comment = await commentRepository.findById(id);
    if (!comment) {
      throw new AppError("Comentario no encontrado.", 404, "COMMENT_NOT_FOUND");
    }
    return this.populateUser(comment);
  }

  async update(id, data) {
    const comment = await commentRepository.updateById(id, data);
    if (!comment) {
      throw new AppError("Comentario no encontrado.", 404, "COMMENT_NOT_FOUND");
    }
    return this.populateUser(comment);
  }

  async setActive(id, isActive) {
    const comment = await commentRepository.setActive(id, isActive);
    if (!comment) {
      throw new AppError("Comentario no encontrado.", 404, "COMMENT_NOT_FOUND");
    }
    return this.populateUser(comment);
  }

  async remove(id) {
    return this.setActive(id, false);
  }

  buildStats(comments) {
    const total = comments.length;
    const sum = comments.reduce((total, comment) => total + comment.rating, 0);

    return {
      total,
      average: total > 0 ? round(sum / total) : 0,
      distribution: [5, 4, 3, 2, 1].map((stars) => {
        const count = comments.filter((comment) => comment.rating === stars).length;
        return { stars, count, percentage: percentage(count, total) };
      })
    };
  }

  toIaComments(comments) {
    return comments.map((comment) => ({
      text: comment.comment,
      rating: comment.rating
    }));
  }

  async getSummary(eventId) {
    const comments = await this.listByEvent(eventId);
    const stats = this.buildStats(comments);

    let ai = null;

    if (comments.length > 0) {
      try {
        const analysis = await iaService.analyzeReviews(this.toIaComments(comments));
        ai = {
          positiveAspects: analysis.positiveAspects ?? "",
          negativeAspects: analysis.negativeAspects ?? "",
          summary: analysis.summary ?? ""
        };
      } catch (error) {
        // Los números y los comentarios siguen disponibles si Groq falla.
        console.error("[comments] No se pudo generar el resumen IA:", error.message);
      }
    }

    return { ...stats, ai };
  }

  async getSentiment(eventId) {
    const comments = await this.listByEvent(eventId);
    const stats = this.buildStats(comments);

    if (comments.length === 0) {
      return {
        ...stats,
        enoughData: false,
        message: "Todavía no hay comentarios activos para analizar.",
        analyzed: 0,
        sentiment: null,
        sentiments: SENTIMENTS.map((label) => ({
          label,
          count: 0,
          percentage: 0
        })),
        positiveAspects: "",
        negativeAspects: "",
        summary: ""
      };
    }

    const analysis = await iaService.analyzeReviews(this.toIaComments(comments));
    const counts = { Positivo: 0, Neutral: 0, Negativo: 0 };
    let analyzed = 0;

    for (const item of analysis.items ?? []) {
      const index = Number(item?.index);
      const sentiment = item?.sentiment;

      if (!Number.isInteger(index) || index < 0 || index >= comments.length) continue;
      if (!Object.prototype.hasOwnProperty.call(counts, sentiment)) continue;

      counts[sentiment] += 1;
      analyzed += 1;
    }

    const sentiments = SENTIMENTS.map((label) => ({
      label,
      count: counts[label],
      percentage: percentage(counts[label], analyzed)
    }));

    const sentiment = analyzed > 0
      ? SENTIMENTS.reduce((best, label) =>
          counts[label] > counts[best] ? label : best
        )
      : null;

    return {
      ...stats,
      enoughData: analyzed > 0,
      message: analyzed > 0 ? undefined : "No se ha podido analizar ningún comentario.",
      analyzed,
      sentiment,
      sentiments,
      positiveAspects: analysis.positiveAspects ?? "",
      negativeAspects: analysis.negativeAspects ?? "",
      summary: analysis.summary ?? ""
    };
  }
}

module.exports = new CommentService();
