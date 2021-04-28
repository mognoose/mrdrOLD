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
        joined: {
        type: Sequelize.BOOLEAN
      }
    });
  
    return Player;
  };