import aj from "../config/arctjet.js";

const arcjectMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) return res.status(429).json({ error: 'Rate limit exceeded' });
            if (decision.reason.isBot())       return res.status(403).json({ error: 'Bot detected' });
            return res.status(403).json({ error: 'Access denied' });
        }

        next();
    } catch (error) {
        // Fail open in development — Arcjet cloud / local QStash may not be reachable.
        // Log the error but let the request continue so the API still works.
        console.warn(`⚠️  Arcjet middleware skipped (connection error): ${error.message}`);
        next();
    }
}

export default arcjectMiddleware;