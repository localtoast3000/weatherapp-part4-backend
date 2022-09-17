const mongoose = require('mongoose');
const chalk = require('chalk');

async function mongoDbConnector() {
  try {
    const connection = await mongoose.connect(process.env.MONGO_DB_CONNECTION_STRING + process.env.DB_NAME);
    if (connection)
      return console.log(
        `
${
  chalk.yellowBright('Connected to the ') +
  chalk.whiteBright(process.env.DB_NAME) +
  chalk.yellowBright(' Mongo DB database')
}
`
      );
    else console.log(`Failed to connect to the "${process.env.DB_NAME}" Mongo DB database`);
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = mongoDbConnector;
