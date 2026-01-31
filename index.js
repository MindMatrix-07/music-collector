const supabase = require('./utils/supabase');
const YTMusic = require('ytmusic-api');

const ytmusic = new YTMusic();

async function processQueue() {
    console.log('[Collector] Waking up...');

    try {
        await ytmusic.initialize();
    } catch (e) {
        console.error('[Error] Failed to initialize YTMusic:', e);
        return;
    }

    // 1. Fetch pending requests
    const { data: requests, error } = await supabase
        .from('request_queue')
        .select('*')
        .order('priority', { ascending: false })
        .order('requested_at', { ascending: true })
        .limit(5);

    if (error) {
        console.error('[Error] Fetching queue:', error);
        return;
    }

    if (!requests || requests.length === 0) {
        console.log('[Collector] Queue empty. Going back to sleep.');
        return;
    }

    console.log(`[Collector] Found ${requests.length} pending items.`);

    // 2. Process each item 
    for (const req of requests) {
        console.log(`[Processing] ${req.query} (ID: ${req.id})`);

        try {
            // Search YouTube Music
            const songs = await ytmusic.search(req.query);

            if (!songs || songs.length === 0) {
                console.log(`[Warning] No results found for: ${req.query}`);
                // Optional: Status = FAILED in a future tracks entry
                await supabase.from('request_queue').delete().eq('id', req.id);
                continue;
            }

            // Pick the best match (first one usually)
            const match = songs[0];

            const trackData = {
                title: match.name,
                artist: match.artist?.name || 'Unknown',
                status: 'AVAILABLE',
                playback_metadata: {
                    youtube_id: match.videoId,
                    duration: match.duration,
                    thumbnail: match.thumbnails?.[match.thumbnails.length - 1]?.url // Highest quality
                }
            };

            // Write to Tracks Table
            const { error: insertError } = await supabase
                .from('tracks')
                .insert(trackData);

            if (insertError) throw insertError;

            // Remove from queue
            await supabase
                .from('request_queue')
                .delete()
                .eq('id', req.id);

            console.log(`[Success] Collected: ${trackData.title} by ${trackData.artist}`);

        } catch (err) {
            console.error(`[Failed] Could not process ${req.query}:`, err);
            // In a real system, increment retry count or mark dead-letter
        }
    }

    console.log('[Collector] Batch complete.');
}

// Run immediately if called directly (for testing)
processQueue();

module.exports = { processQueue };
