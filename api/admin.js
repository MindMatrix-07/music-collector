const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async (req, res) => {
    const adminPass = process.env.ADMIN_PASSWORD;
    const userPass = req.headers['x-admin-password'];

    // SECURITY CHECK
    if (!adminPass || userPass !== adminPass) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Fetch Stats
        const { count: pendingCount } = await supabase
            .from('request_queue')
            .select('*', { count: 'exact', head: true });

        const { count: totalCount } = await supabase
            .from('tracks')
            .select('*', { count: 'exact', head: true });

        res.status(200).json({
            pending: pendingCount || 0,
            total: totalCount || 0,
            status: 'ONLINE'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
