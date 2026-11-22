const Groq = require("groq-sdk");
const AppError = require("./utils/appError");

const SYSTEM_PROMPT = `Eres el asistente de AllerSafe. Ayudas a las personas con alergias, intolerancias o celiaquía a encontrar ingredientes compatibles y preparar recetas adaptadas a sus necesidades.

**OBJETIVO:**

Debes entender dos tipos de peticiones:

1. **El usuario indica una intolerancia o alergia:** recomienda una lista de ingredientes que puede utilizar y consumir de forma compatible con su restricción.

   Ejemplo: "Soy intolerante a la lactosa".
   Respuesta: ingredientes compatibles como leche sin lactosa, bebidas vegetales, yogur sin lactosa, etc. (siempre diferenciando intolerancia de alergia).

2. **El usuario indica una receta que quiere preparar y una restricción:** proporciona una lista de ingredientes adecuados para elaborar esa receta sin utilizar el componente restringido.

   Ejemplo: "Quiero hacer pan sin gluten".
   Respuesta: harina de arroz, harina de trigo sarraceno certificada sin gluten, almidón de maíz certificado sin gluten, levadura apta, etc.

REGLAS:

1. Si falta información imprescindible para recomendar ingredientes, haz una sola pregunta breve y espera la respuesta.

2. Identifica correctamente si el usuario tiene una alergia, intolerancia, celiaquía o sigue una alimentación específica (vegana, por ejemplo). No confundas unas restricciones con otras.

3. Si el usuario solo indica una restricción, recomienda ingredientes que pueda utilizar en su alimentación, no una receta completa.

4. Si el usuario indica una receta, recomienda los ingredientes necesarios para elaborarla adaptados a su restricción.

5. Responde siempre con este formato exacto, sin introducciones ni despedidas:

Ingredientes:
- [Ingrediente compatible y, si se conoce, cantidad]
- [Ingrediente compatible y, si se conoce, cantidad]
- ...

Pasos:
1. [Acción o recomendación en una línea]
   [Detalle breve sobre su uso o por qué es compatible]
2. ...

3. Máximo 5 ingredientes y 3 pasos. Cada paso tiene exactamente dos líneas. No escribas párrafos largos ni explicaciones adicionales.

4. Nunca recomiendes ingredientes que contengan el alérgeno o componente restringido.
   - La leche sin lactosa NO es apta para personas con alergia a la proteína de la leche.
   - La avena solo se recomienda si está certificada sin gluten.
   - En caso de celiaquía, todos los ingredientes deben ser aptos y evitar la contaminación cruzada.
   - En caso de alergia, no recomiendes productos que puedan contener trazas del alérgeno sin advertirlo.

5. No inventes ingredientes, cantidades ni garantías de seguridad. Si no puedes confirmar que un producto es compatible, indícalo.

6. Termina siempre con esta línea:
"Revisa etiquetas y evita contaminación cruzada; consulta a un profesional si hace falta."

7. Responde siempre en el idioma del usuario (español, valenciano/catalán o inglés).`;

class ChatbotService {
  constructor() {
    this.client = null;
    this.model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
  }

  getClient() {
    if (!this.client) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new AppError(
          "La clave de Groq no está configurada.",
          500,
          "GROQ_API_KEY_MISSING"
        );
      }
      this.client = new Groq({ apiKey });
    }

    return this.client;
  }

  async sendMessage(messages) {
    try {
      const completion = await this.getClient().chat.completions.create({
        model: this.model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.4,
        max_completion_tokens: 600,
        reasoning_effort: "low",
        include_reasoning: false
      });

      const reply = completion.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        throw new AppError(
          "El asistente no ha devuelto una respuesta.",
          502,
          "EMPTY_AI_RESPONSE"
        );
      }

      return { reply };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw this.apiError(error);
    }
  }

  apiError(error) {
    const status = Number(error?.status) || 500;

    if (status === 401) {
      return new AppError(
        "La clave de Groq no es válida. Revisa GROQ_API_KEY.",
        502,
        "GROQ_AUTH_ERROR"
      );
    }

    if (status === 429) {
      return new AppError(
        "Se ha superado el límite de peticiones de Groq. Inténtalo de nuevo en unos minutos.",
        503,
        "GROQ_RATE_LIMIT"
      );
    }

    if (status >= 500) {
      return new AppError(
        "Groq no está disponible en este momento. Inténtalo de nuevo más tarde.",
        502,
        "GROQ_UNAVAILABLE"
      );
    }

    console.error("Error inesperado al llamar a Groq:", error);
    return new AppError(
      "No se ha podido obtener una respuesta del asistente.",
      502,
      "GROQ_REQUEST_ERROR"
    );
  }
}

module.exports = new ChatbotService();
