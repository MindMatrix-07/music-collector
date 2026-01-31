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

    const action = req.query.action;

    try {
        // DELETE ACTION (POST)
        if (req.method === 'POST' && action === 'delete') {
            const { table, id } = req.body;
            if (!['tracks', 'request_queue'].includes(table) || !id) {
                return res.status(400).json({ error: 'Invalid parameters' });
            }

            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true });
        }

        // LIST QUEUE
        if (action === 'queue') {
            const { data, error } = await supabase
                .from('request_queue')
                .select('*')
                .order('created_at', { ascending: false }); // Show newest first
            //.limit(100); 

            if (error) throw error;
            return res.status(200).json(data);
        }

        // LIST TRACKS
        if (action === 'tracks') {
            const { data, error } = await supabase
                .from('tracks')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Limit to last 50 for performance

            if (error) throw error;
            return res.status(200).json(data);
        }

        // DEFAULT: STATS
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
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
