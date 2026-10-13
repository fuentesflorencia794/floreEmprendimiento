
const productos = {
  1: { name: "Mini selladora de bolsas", price: 15990 },
  2: { name: "Kit viajero FLORÉ", price: 34990 },
  3: { name: "Aspiradora portátil", price: 39990 },
  4: { name: "Luz LED con sensor", price: 18990 },
  5: { name: "Organizador de cables", price: 16990 },
  6: { name: "Mini impresora térmica", price: 32990 },
  7: { name: "Organizador de cocina", price: 19990 },
  8: { name: "Soporte para celular", price: 14990 }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Método no permitido" };
  }

  try {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!token) throw new Error("Falta el token de prueba");

    const { items } = JSON.parse(event.body || "{}");

    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Carrito inválido" })
      };
    }

    const itemsSeguros = items.map(item => {
      const id = Number(item.id);
      const producto = productos[id];
      const cantidad = item.quantity;

      if (
        !Number.isInteger(id) ||
        !producto ||
        !Number.isInteger(cantidad) ||
        cantidad < 1 ||
        cantidad > 20
      ) {
        throw new Error("Producto o cantidad inválida");
      }

      return {
        title: producto.name,
        quantity: cantidad,
        unit_price: producto.price,
        currency_id: "ARS"
      };
    });

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          items: itemsSeguros,
          external_reference: `FLORE-TEST-${Date.now()}`
        })
      }
    );

    if (!response.ok) {
      console.error("Mercado Pago respondió:", response.status);
      throw new Error("No se pudo crear la preferencia");
    }

    const data = await response.json();
        if (!data.sandbox_init_point) {
  throw new Error("Mercado Pago no devolvió un enlace de prueba");
}

    return {
      statusCode: 200,
      body: JSON.stringify({ url: data.sandbox_init_point })
    };

  } catch (error) {
    console.error(error.message);

    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No se pudo iniciar el pago de prueba" })
    };
  }
};

