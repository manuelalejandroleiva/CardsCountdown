const hubspot = require("@hubspot/api-client");

exports.main = async (context) => {
  const hubspotClient = new hubspot.Client({
    accessToken: process.env.PRIVATE_APP_ACCESS_TOKEN
  });

  const objectId = context.parameters?.objectId;
  if (!objectId) {
    console.error("No objectId recibido");
    return { tiempo_restante_sla: null, createdDate: null };
  }

  try {
    // Obtenemos propiedades del deal o ticket
    const { properties } = await hubspotClient.crm.tickets.basicApi.getById(
      objectId,
      ["tiempo_restante_sla", "hs_createdate","tiempo_consumido_sla",
        "hs_pipeline","hs_pipeline_stage","tiempo_restante_sla_2"
      ] // hs_createdate sirve como fallback
    );

    return {
      tiempo_restante_sla: properties.tiempo_restante_sla || null,
      tiempo_restante_sla_2: properties.tiempo_restante_sla_2 || null,
      tiempo_consumido_sla: properties.tiempo_consumido_sla || null,
      createdDate: properties.hs_createdate|| null,
      stage: properties.hs_pipeline_stage || null,
      pipeline: properties.hs_pipeline || null
    };
  } catch (error) {
    console.error("Error obteniendo SLA:", error);
    return { tiempo_restante_sla: null, createdDate: null };
  }
};
