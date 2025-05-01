export class Logger {
	private static instance: Logger;
	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	private formatMessage(level: string, message: string, meta?: any): string {
		const timestamp = new Date().toISOString();
		const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
		return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
	}

	error(message: string, meta?: any): void {
		console.error(this.formatMessage("error", message, meta));
	}

	warn(message: string, meta?: any): void {
		console.warn(this.formatMessage("warn", message, meta));
	}

	info(message: string, meta?: any): void {
		console.info(this.formatMessage("info", message, meta));
	}

	debug(message: string, meta?: any): void {
		console.debug(this.formatMessage("debug", message, meta));
	}
}

export const logger = Logger.getInstance();
