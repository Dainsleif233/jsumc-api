type LogLevel = 'info' | 'warn' | 'error';

export default class Logger {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    private log(level: LogLevel, message: string, fields?: Record<string, any>) {
        const entry = {
            ts: new Date().toISOString(),
            level,
            name: this.name,
            msg: message,
            ...(fields || {})
        };
        const str = JSON.stringify(entry);
        if (level === 'error') console.error(str + '\n');
        else if (level === 'warn') console.warn(str + '\n');
        else console.log(str + '\n');
    }

    info(message: string, fields?: Record<string, any>) {
        this.log('info', message, fields);
    }

    warn(message: string, fields?: Record<string, any>) {
        this.log('warn', message, fields);
    }

    error(message: string, fields?: Record<string, any>) {
        this.log('error', message, fields);
    }
}
