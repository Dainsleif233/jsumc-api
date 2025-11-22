import { createConnection } from 'net';
import { promises as dns } from 'dns';

class VarInt {
    static encode(value) {
        const bytes = [];
        do {
            let temp = value & 0x7F;
            value >>>= 7;
            if (value !== 0) temp |= 0x80;
            bytes.push(temp);
        } while (value !== 0);
        return Buffer.from(bytes);
    }

    static decode(buffer, offset = 0) {
        let numRead = 0;
        let result = 0;
        let read;

        do {
            if (offset + numRead >= buffer.length)
                throw new Error('VarInt is too big');
            read = buffer[offset + numRead];
            const value = read & 0x7F;
            result |= value << (7 * numRead);
            numRead++;
            if (numRead > 5)
                throw new Error('VarInt is too big');
        } while ((read & 0x80) !== 0);

        return { value: result, length: numRead };
    }
}

class PacketBuilder {
    constructor() {
        this.buffer = Buffer.alloc(0);
    }

    writeVarInt(value) {
        const encoded = VarInt.encode(value);
        this.buffer = Buffer.concat([this.buffer, encoded]);
        return this;
    }

    writeString(str) {
        const strBuffer = Buffer.from(str, 'utf-8');
        this.writeVarInt(strBuffer.length);
        this.buffer = Buffer.concat([this.buffer, strBuffer]);
        return this;
    }

    writeUShort(value) {
        const buf = Buffer.allocUnsafe(2);
        buf.writeUInt16BE(value, 0);
        this.buffer = Buffer.concat([this.buffer, buf]);
        return this;
    }

    writeLong(value) {
        const buf = Buffer.allocUnsafe(8);
        buf.writeBigInt64BE(BigInt(value), 0);
        this.buffer = Buffer.concat([this.buffer, buf]);
        return this;
    }

    build() {
        const length = VarInt.encode(this.buffer.length);
        return Buffer.concat([length, this.buffer]);
    }
}

class PacketReader {
    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }

    readVarInt() {
        const result = VarInt.decode(this.buffer, this.offset);
        this.offset += result.length;
        return result.value;
    }

    readString() {
        const length = this.readVarInt();
        const str = this.buffer.toString('utf-8', this.offset, this.offset + length);
        this.offset += length;
        return str;
    }

    readLong() {
        const value = this.buffer.readBigInt64BE(this.offset);
        this.offset += 8;
        return value;
    }
}

export default class MinecraftServerPing {
    #host;
    #port;
    #resolvedHost;
    #resolvedPort;
    #socket;

    constructor(host, port) {
        this.#host = host;
        this.#port = port;
        this.#resolvedHost = host;
        this.#resolvedPort = port;
    }

    async ping() {
        try {
            if (
                this.#port === undefined ||
                this.#port === null ||
                Number.isNaN(this.#port) ||
                this.#port < 0 ||
                this.#port > 65535
            ) await this.#resolveSRV();

            await this.#connect();
            await this.#handshake();

            const target = `${this.#resolvedHost}:${this.#resolvedPort}`;
            const info = await this.#readPacket();
            const latency = await this.#measureLatency();

            return { target, info, latency };
        } finally {
            this.#disconnect();
        }
    }

    async #resolveSRV() {
        try {
            const srvDomain = `_minecraft._tcp.${this.#host}`;
            const records = await dns.resolveSrv(srvDomain);

            const sortedRecords = records.sort((a, b) => {
                if (a.priority !== b.priority)
                    return a.priority - b.priority;
                else return b.weight - a.weight;
            });

            const srv = sortedRecords[0];
            this.#resolvedHost = srv.name;
            this.#resolvedPort = srv.port;
        } catch {
            this.#resolvedPort = 25565;
        }
    }

    async #connect() {
        return new Promise((resolve, reject) => {
            this.#socket = createConnection({
                host: this.#resolvedHost,
                port: this.#resolvedPort
            }, resolve);

            this.#socket.setTimeout(5000);
            
            this.#socket.on('timeout', () => {
                reject(new Error('Connection timeout'));
                this.#socket.destroy();
            });

            this.#socket.on('error', (err) => {
                reject(err);
            });
        });
    }

    async #handshake() {
        let builder = new PacketBuilder();
        builder.writeVarInt(0x00);
        builder.writeVarInt(-1);
        builder.writeString(this.#host);
        builder.writeUShort(this.#resolvedPort);
        builder.writeVarInt(1);
        const handshakePacket = builder.build();

        builder = new PacketBuilder();
        builder.writeVarInt(0x00);
        const statusRequestPacket = builder.build();
        
        this.#socket.write(Buffer.concat([handshakePacket, statusRequestPacket]));
    }

    async #readPacket() {
        const responseData = await this.#receivePacket();
        const reader = new PacketReader(responseData);
        
        const packetId = reader.readVarInt();
        if (packetId !== 0x00)
            throw new Error(`Expected packet ID 0x00, got 0x${packetId.toString(16)}`);

        const jsonString = reader.readString();
        return JSON.parse(jsonString);
    }

    async #receivePacket() {
        return new Promise((resolve, _) => {
            let received = Buffer.alloc(0);
            let packetLength = null;
            let lengthBytes = 0;

            const onData = (data) => {
                received = Buffer.concat([received, data]);

                if (packetLength === null) {
                    try {
                        const result = VarInt.decode(received, 0);
                        packetLength = result.value;
                        lengthBytes = result.length;
                    } catch {
                        return;
                    }
                }

                if (received.length >= lengthBytes + packetLength) {
                    this.#socket.removeListener('data', onData);
                    const packetData = received.subarray(lengthBytes, lengthBytes + packetLength);
                    resolve(packetData);
                }
            };

            this.#socket.on('data', onData);
        });
    }

    async #measureLatency() {
        const builder = new PacketBuilder();
        builder.writeVarInt(0x01);
        builder.writeLong(Date.now());
        const pingPacket = builder.build();
        
        const start = Date.now();
        this.#socket.write(pingPacket);

        const packet = await this.#receivePacket();
        const end = Date.now();

        const reader = new PacketReader(packet);
        const packetId = reader.readVarInt();

        if (packetId !== 0x01)
            throw new Error(`Expected pong packet ID 0x01, got 0x${packetId.toString(16)}`);

        return end - start;
    }

    #disconnect() {
        if (this.#socket) {
            this.#socket.destroy();
            this.#socket = null;
        }
    }
}