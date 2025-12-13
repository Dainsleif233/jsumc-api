type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export default class Logger {
    private name: string;

    constructor(name: string) {
        this.name = name;
    }

    private log(level: LogLevel, msg: string, fields: string[]) {
        let formattedMsg = msg;
        fields.forEach((field, index) => {
            const regex = new RegExp(`\\{${index}\\}`, 'g');
            formattedMsg = formattedMsg.replace(regex, field);
        });
        fields.forEach((field) => {
            formattedMsg = formattedMsg.replace(/\{\}/, field);
        });

        const str = `[${new Date().toLocaleTimeString()}] [${this.name}/${level}]: ${formattedMsg}`;
        if (level === 'ERROR') console.error(str);
        else if (level === 'WARN') console.warn(str);
        else console.log(str);
    }

    info(msg: string, ...fields: string[]) {
        this.log('INFO', msg, fields);
    }

    warn(msg: string, ...fields: string[]) {
        this.log('WARN', msg, fields);
    }

    error(msg: string, ...fields: string[]) {
        this.log('ERROR', msg, fields);
    }
}
