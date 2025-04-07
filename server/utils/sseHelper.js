/**
 * Server-Sent Events (SSE) Helper
 *
 * This utility module provides functions for setting up and managing
 * Server-Sent Events (SSE) connections.
 */

/**
 * Initialize an SSE connection with the client
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {String} source - Source identifier for logging
 * @returns {Function|null} - The sendEvent function or null if setup failed
 */
const setupSSE = (req, res, source = "unknown") => {
	try {
		// Disable any middleware that might compress or buffer the response
		res.flushHeaders = true;

		// Set headers for SSE
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");
		res.setHeader("X-Accel-Buffering", "no"); // Disable buffering for nginx

		// Allow CORS
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Credentials", "true");

		// Important: Set status before writing any data
		res.statusCode = 200;

		/**
		 * Helper function to send events to the client
		 *
		 * @param {Object} data - The data to send
		 * @param {String} [eventType=null] - Optional event type
		 */
		const sendEvent = (data, eventType = null) => {
			if (eventType || data.type) {
				const event = eventType || data.type;
				res.write(`event: ${event}\n`);
			}
			res.write(`data: ${JSON.stringify(data)}\n\n`);
		};

		// Send initial connection established event
		sendEvent({
			type: "connection",
			status: "connected",
			message: `SSE connection established via ${source}`,
			timestamp: new Date().toISOString(),
		});

		// Keep the connection alive with keepalive messages
		const keepAlive = setInterval(() => {
			res.write(`: ${new Date().toISOString()}\n\n`);
		}, 15000);

		// Cleanup on connection close
		req.on("close", () => {
			clearInterval(keepAlive);
			console.log(`SSE connection closed from ${source}`);
		});

		// Store the sendEvent function and keepAlive interval in the request
		req.sendEvent = sendEvent;
		req.sseKeepAlive = keepAlive;

		return sendEvent;
	} catch (error) {
		console.error("SSE setup error:", error);
		if (!res.headersSent) {
			res.status(500).json({
				success: false,
				message: "Failed to establish SSE connection",
				error: error.message,
			});
		}
		return null;
	}
};

/**
 * Cleanup SSE connection resources
 *
 * @param {Object} req - Express request object
 */
const cleanupSSE = (req) => {
	if (req.sseKeepAlive) {
		clearInterval(req.sseKeepAlive);
	}
};

module.exports = {
	setupSSE,
	cleanupSSE,
};
