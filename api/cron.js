const { processQueue } = require('../index');

module.exports = async (req, res) => {
    // Vercel automatically adds this header to cron requests
    const authHeader = req.headers['authorization'];

    // In a real production environment, verify the CRON_SECRET
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //    return res.status(401).end('Unauthorized');
    // }

    try {
        await processQueue();
        res.status(200).send('Collector finished.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Collector failed.');
    }
};
