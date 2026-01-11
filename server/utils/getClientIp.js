/**
 * Get the real client IP address from request
 * Handles proxies, IPv6, and various deployment scenarios
 */
export const getClientIp = (req) => {
    // Try x-forwarded-for (when behind proxy)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // Get first IP if multiple (client, proxy1, proxy2...)
        const ip = forwarded.split(',')[0].trim();
        return ip;
    }

    // Try x-real-ip (some proxies use this)
    const realIp = req.headers['x-real-ip'];
    if (realIp) {
        return realIp;
    }

    // Fallback to req.ip (Express)
    if (req.ip) {
        // Convert IPv6 localhost to IPv4
        if (req.ip === '::1' || req.ip === '::ffff:127.0.0.1') {
            return '127.0.0.1';
        }
        // Strip IPv6 prefix if present (::ffff:192.168.1.1 -> 192.168.1.1)
        return req.ip.replace(/^::ffff:/, '');
    }

    // Fallback to socket
    const socketIp = req.socket?.remoteAddress;
    if (socketIp) {
        if (socketIp === '::1' || socketIp === '::ffff:127.0.0.1') {
            return '127.0.0.1';
        }
        return socketIp.replace(/^::ffff:/, '');
    }

    return '127.0.0.1'; // Ultimate fallback
};
