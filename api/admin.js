const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

module.exports = async (req, res) => {
    const adminPass = process.env.ADMIN_PASSWORD;
    const userPass = req.headers['x-admin-password'];

    const action = req.query.action;

    // LOGIN ACTION (Verify Captcha)
    if (req.method === 'POST' && action === 'login') {
        const { password, token } = req.body;
        const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;

        // 1. Check Password
        if (password !== adminPass) {
            return res.status(401).json({ error: 'Invalid Password' });
        }

        // 2. Verify Turnstile (if configured)
        if (turnstileSecret && token) {
            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: turnstileSecret,
                    response: token
                })
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) {
                return res.status(403).json({ error: 'Captcha Validation Failed' });
            }
        }

        return res.status(200).json({ success: true });
    }

    // SECURITY CHECK (For all other actions)
    if (!adminPass || userPass !== adminPass) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

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
                .order('requested_at', { ascending: false }); // Show newest first
            //.limit(100); 

            if (error) throw error;
            return res.status(200).json(data);
        }

        // LIST TRACKS
        if (action === 'tracks') {
            const { data, error } = await supabase
                .from('tracks')
                .select('*')
                .order('last_updated', { ascending: false })
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
