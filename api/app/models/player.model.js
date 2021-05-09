module.exports = (sequelize, Sequelize) => {
    const Player = sequelize.define("player", {
      name: {
        type: Sequelize.STRING
      },
        room: {
        type: Sequelize.STRING
      },
        points: {
        type: Sequelize.INTEGER
      },
        role: {
        type: Sequelize.STRING
      },
        alive: {
        type: Sequelize.BOOLEAN
      },
        ready: {
        type: Sequelize.BOOLEAN
      },
        joined: {
        type: Sequelize.BOOLEAN
      }
    });
  
    return Player;
  };