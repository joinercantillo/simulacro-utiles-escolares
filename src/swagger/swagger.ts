import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RiwiMediCare Plus API",
      version: "1.0.0",
      description:
        "API REST para la gestión de solicitudes de abastecimiento de medicamentos. " +
        "Permite administrar clínicas, responsables, almacenes, inventario y el ciclo de vida " +
        "de las solicitudes de abastecimiento.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;