module.exports = {
    HOST: "localhost",
    USER: "mrdr",
    PASSWORD: "mrdr",
    DB: "mrdr",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };