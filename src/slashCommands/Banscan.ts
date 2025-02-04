import { SlashCommandBuilder, ChannelType, TextChannel, EmbedBuilder } from "discord.js"
import { SlashCommand } from "../types";

const testCommand: SlashCommand = {
    command: new SlashCommandBuilder()
        .setName("BanEvader")
        .setDescription("Checks to see if the user is ban from the server on another account or is bypassing.")
        .addStringOption(option => {
            return option
                .setName("DiscordID")
                .setDescription("Enter the users discord ID to have them checked.")
                .setRequired(true);
        }),
    execute: async (interaction) => {
        const options: { [key: string]: string | number | boolean } = {};
        for (let i = 0; i < interaction.options.data.length; i++) {
            const element = interaction.options.data[i];
            if (element.name && element.value) options[element.name] = element.value;
        }

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({ name: "Response Title" })
                    .setDescription(`Code 6 Sever Guard
                    User ID: ${options.DiscordID}
                    Results: CANT CONNECT TO API`)
            ]
        })
    },
    cooldown: 3
}

export default testCommand;
