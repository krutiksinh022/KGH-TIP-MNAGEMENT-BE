// swagger.js
export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KGH TIP API",
      version: "1.0.0",
      description: "API documentation for KGH TIP backend",
    },
    servers: [
      {
        url: "http://localhost:5000", // Change to your actual port
      },
    ],
  },
  apis: ["./routes/**/*.js"], // path to your route files
};
