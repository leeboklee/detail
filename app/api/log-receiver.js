// Disabled legacy handler (migrated to app/api/log-receiver/route.js)
export default function handler(req, res) {
	res.status(410).json({ success: false, message: 'This endpoint has moved to app/api/log-receiver' });
} 