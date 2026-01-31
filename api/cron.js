const { processQueue } = require('../index');

module.exports = async (req, res) => {
    // Vercel automatically adds this header to cron requests
    // SECURITY GATES
    const cronSecret = process.env.CRON_SECRET;
    const adminPass = process.env.ADMIN_PASSWORD;

    const authHeader = req.headers['authorization']; // Standard Bearer
    const adminHeader = req.headers['x-admin-password']; // Manual Admin

    // 1. Cloudflare/GitHub Check (Bearer Secret)
    const isRobot = cronSecret && authHeader === `Bearer ${cronSecret}`;

    // 2. Admin Dashboard Check (Password)
    const isAdmin = adminPass && adminHeader === adminPass;

    if (!isRobot && !isAdmin) {
        console.log("Unauthorized Access Attempt");
        return res.status(401).send('Unauthorized: Invalid Secret or Password');
    }

    try {
        await processQueue();
        res.status(200).send('Collector finished.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Collector failed.');
    }
};
