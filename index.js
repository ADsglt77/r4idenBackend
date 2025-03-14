const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const {Client} = require("discord.js");
const axios = require("axios");

const app = express();
app.use(cors());

const server = ["devweb"];
const prisma = new PrismaClient();
const client = new Client({ intents: ["GuildPresences", "GuildMembers", "Guilds"] });
client.login("MTM0NDY3NTI0MTI4NDA3NTU2MA.GKtgB8.LFFR6s3MQO814XfGcAhuxujin7cZWRRj0vkzLE");

app.get("/view", async (req, res) => {
	res.send({ view: await prisma.view.count() });

    if ((await prisma.view.count({where: {ip: req.ip}})) == 0) {
        await prisma.view.create({
            data: {
                ip: req.ip,
            },
        });
    }
});

app.get("/discord", async (req, res) => {
	const guild = client.guilds.cache.get("1333815305570357380");
	if (!guild) return { precence: "offline", activity: null };

	const member = await guild.members.fetch("403779900739420171");
	if (!member) return { precence: "offline", activity: null };

	const a = member.presence?.activities.filter((a) => a.type === 4)[0];
    return res.send({
        name: member?.user.username,
        precence: member?.presence?.status || "offline",
        activity: {
            text: a?.state || null,
            icon: a?.emoji?.imageURL() || null,
        },
    });
});

app.get("/servers", async (req, res) => {
	res.send(
		await Promise.all(
			server.map(async (server) => {
				const { data: api } = await axios.get(`https://discord.com/api/v9/invites/${server}?with_counts=true`);
				return {
					name: api.guild.name,
					invite: server,
					member: api.approximate_member_count,
					online: api.approximate_presence_count,
					icon: `https://cdn.discordapp.com/icons/${api.guild.id}/${api.guild.icon}.png`,
				};
			})
		)
	);
});

app.listen(3000, () => {
	console.log("Server started on port 3000");
});
