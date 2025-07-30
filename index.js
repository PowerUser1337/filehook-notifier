if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const chokidar = require("chokidar");
const path = require("path");
const { WebhookClient, EmbedBuilder, Colors } = require("discord.js");
const fs = require("fs");

const folder = process.env.DIRECTORY_PATH;
if (!folder) {
  throw new Error("You must set the DIRECTORY_PATH environment variable.");
}

if (!process.env.DISCORD_WEBHOOK_ID || !process.env.DISCORD_WEBHOOK_TOKEN) {
  throw new Error(
    "You must set the DISCORD_WEBHOOK_ID and DISCORD_WEBHOOK_TOKEN environment variables."
  );
}

const client = new WebhookClient({
  id: process.env.DISCORD_WEBHOOK_ID,
  token: process.env.DISCORD_WEBHOOK_TOKEN,
});
const watcher = chokidar.watch(folder, { ignored: /^\./, persistent: true });

watcher
  .on("add", (filePath) => {
    const fileName = path.basename(filePath, path.extname(filePath));

    const embed = new EmbedBuilder().setColor(Colors.Blue);

    const fileContent = fs.readFileSync(filePath, "utf8");

    if (fileContent.includes("0")) {
      embed.setDescription(
        `Aktualizacja **${fileName}** została zainstalowana pomyślnie`
      );
    } else if (fileContent.includes("255")) {
      embed.setDescription(`Aktualizacja **${fileName}** niepowodzenie`);
    }

    client.send({ embeds: [embed] }).catch(console.log);
  })
  .on("unlink", (filePath) => {
    const fileName = path.basename(filePath, path.extname(filePath));

    const embed = new EmbedBuilder()
      .setColor(Colors.Red)
      .setDescription(`File: ${fileNameWithoutExt} has been deleted.`);

    client.send({ embed: [embed] }).catch(console.log);
  });

(() => {
  setInterval(() => {
    fs.writeFileSync(
      path.join(folder, `${Math.random() * 2388384}.txt`),
      Math.floor(Math.random() * 2) == 1 ? "0" : "255",
      { flag: "w" }
    );
  }, 1000);
})();
