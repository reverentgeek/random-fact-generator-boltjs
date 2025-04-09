import bolt from "@slack/bolt";
import axios from "axios";
const { App } = bolt;

// Initialize the Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
});

// Make an API call to retrieve a random fact
async function getUselessFact() {
  const res = await axios.get(
    "https://uselessfacts.jsph.pl/api/v2/facts/random",
  );
  return res.status === 200 ? res.data : null;
}

// Define the function for Workflow Builder
app.function("useless_fact_step", async ({ complete, fail, logger }) => {
  try {
    app.logger.info("Running useless fact step...");
    // Get the fact using the API
    const fact = await getUselessFact();
    if (fact?.text) {
      // Use complete() to send results to Slack
      await complete({
        outputs: {
          message: fact.text,
        },
      });
    } else {
      // Use fail() to send an error to Slack
      await fail({
        error: "There was an error retrieving a random useless fact :cry:",
      });
    }
  } catch (error) {
    // Log the error and send an error message back to Slack
    logger.error(error);
    await fail({ error: `There was an error :cry: : ${error}` });
  }
});

// Start the Bolt App!
async function main() {
  await app.start(process.env.PORT || 3000);
  app.logger.info("⚡️ Bolt app is running!");
}

main();
