export default {
    async scheduled(event, env, ctx) {
        console.log("Cron trigger fired");
        // Ping the Vercel Collector
        // Ping the Vercel Collector with SECRET and extended timeout
        // Note: Replace "CRON_SECRET_123" with the simpler hardcoded secret or use env binding
        const response = await fetch("https://musiccollector.vercel.app/api/cron", {
            headers: {
                "Authorization": "Bearer CRON_SECRET_123",
                "x-cron-secret": "CRON_SECRET_123"
            }
        });
        console.log(`Collector response: ${response.status}`);
    },
};
