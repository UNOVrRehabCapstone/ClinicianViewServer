import {afterAll, beforeAll, expect, jest, test, describe,} from "@jest/globals"
import { createServer } from "node:http";
import { type AddressInfo } from "node:net";
import { io as ioc, type Socket as ClientSocket } from "socket.io-client";
import { Server, type Socket as ServerSocket } from "socket.io";

describe("DEFAULT SOCKETIO TESTS", () => {
    let io:any , serverSocket:any, clientSocket:any;
  
    beforeAll((done) => {
      const httpServer = createServer();
      io = new Server(httpServer);
      httpServer.listen(() => {
        const port = (httpServer.address() as AddressInfo).port;
        clientSocket = ioc(`http://localhost:${port}`);
        io.on("connection", (socket:any) => {
          serverSocket = socket;
        });
        clientSocket.on("connect", done);
      });
    });
  
    afterAll(() => {
      io.close();
      clientSocket.disconnect();
    });
  
    test("should work", (done) => {
      clientSocket.on("hello", (arg:any) => {
        expect(arg).toBe("world");
        done();
      });
      serverSocket.emit("hello", "world");
    });
  
    test("should work with an acknowledgement", (done) => {
      serverSocket.on("hi", (cb:any) => {
        cb("hola");
      });
      clientSocket.emit("hi", (arg:any) => {
        expect(arg).toBe("hola");
        done();
      });
    });
  
    test("should work with emitWithAck()", async () => {
      serverSocket.on("foo", (cb:any) => {
        cb("bar");
      });
      const result = await clientSocket.emitWithAck("foo");
      expect(result).toBe("bar");
    });

  });