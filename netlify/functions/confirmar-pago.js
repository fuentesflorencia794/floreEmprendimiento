
const crypto = require("node:crypto");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const secreto = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!token || !secreto) {
    console.error("Faltan credenciales de Mercado Pago");
    return { statusCode: 503, body: "Servicio no configurado" };
  }

  const headers = Object.fromEntries(
    Object.entries(event.headers || {}).map(
      ([clave, valor]) => [clave.toLowerCase(), valor]
    )
  );

  const firma = headers["x-signature"] || "";
  console.log("¿Llegó la firma?", Boolean(firma));
console.log("¿Llegó el request ID?", Boolean(headers["x-request-id"]));
  const requestId = headers["x-request-id"] || "";
  const parametros = event.queryStringParameters || {};
  const paymentId = String(
    parametros["data.id"] || parametros["data_id"] || ""
  );

  const partes = Object.fromEntries(
    firma.split(",").map(parte => {
      const posicion = parte.indexOf("=");
      return [
        parte.slice(0, posicion).trim(),
        parte.slice(posicion + 1).trim()
      ];
    })
  );

  if (
    !requestId ||
    !/^\d+$/.test(paymentId) ||
    !/^\d+$/.test(partes.ts || "") ||
    !/^[a-f0-9]{64}$/i.test(partes.v1 || "")
  ) {
    return { statusCode: 401, body: "Firma inválida" };
  }

  const mensaje =
    `id:${paymentId};request-id:${requestId};ts:${partes.ts};`;
console.log("¿Coinciden los datos de firma?", {
  paymentId,
  tieneTs: Boolean(partes.ts),
  tieneV1: Boolean(partes.v1)
});
  const firmaCalculada = crypto
    .createHmac("sha256", secreto)
    .update(mensaje)
    .digest();

  const firmaRecibida = Buffer.from(partes.v1, "hex");

  if (!crypto.timingSafeEqual(firmaCalculada, firmaRecibida)) {
    return { statusCode: 401, body: "Firma inválida" };
  }

  try {
    const notificacion = JSON.parse(event.body || "{}");

    if (
      notificacion.type !== "payment" ||
      String(notificacion.data?.id) !== paymentId
    ) {
      return { statusCode: 400, body: "Notificación inválida" };
    }

    const respuesta = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!respuesta.ok) {
      throw new Error("No se pudo consultar el pago");
    }

    const pago = await respuesta.json();

    if (
      typeof pago.external_reference !== "string" ||
      !pago.external_reference.startsWith("FLORE-")
    ) {
      return { statusCode: 400, body: "Pago no reconocido" };
    }

    console.log("Pago consultado:", {
      id: pago.id,
      estado: pago.status,
      referencia: pago.external_reference
    });

    return {
      statusCode: 200,
      body: "Notificación verificada"
    };

  } catch (error) {
    console.error("Error al verificar:", error.message);

    return {
      statusCode: 500,
      body: "Error al verificar el pago"
    };
  }
};
