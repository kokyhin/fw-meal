module.exports = {
  apps: [
    {
      name: "meal-backend",
      script: "bin/www",
      env: {
        NODE_ENV: "production",
        PORT: 3020,
        PRICE_FIRST: 15,
        PRICE_SECOND: 30,
        PRICE_FULL: 40
      }
    }
  ],
}

