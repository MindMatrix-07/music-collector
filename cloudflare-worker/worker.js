export default {
    async scheduled(event, env, ctx) {
        console.log("Cron trigger fired");
        // Ping the Vercel Collector
        const response = await fetch("https://musiccollector.vercel.app/api/cron");
        console.log(`Collector response: ${response.status}`);
    },
};
