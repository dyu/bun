import readlinePromises from "node:readline/promises";
import { EventEmitter } from "node:events";
import { createTest } from "node-harness";
const { describe, it, createDoneDotAll, createCallCheckCtx, assert } = createTest(import.meta.path);

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

class FakeInput extends EventEmitter {
  output = "";
  resume() {}
  pause() {}
  write(data: any) {
    this.output += data;
  }
  end() {}
  reset() {
    this.output = "";
  }
}

// ----------------------------------------------------------------------------
// Tests
// ----------------------------------------------------------------------------

describe("readline/promises.createInterface()", () => {
  it("should throw an error when failed completion", done => {
    const createDone = createDoneDotAll(done);
    const { mustCall, mustNotCall } = createCallCheckCtx(createDone());

    const fi = new FakeInput();
    // @ts-ignore
    const rli = new readlinePromises.Interface({
      input: fi,
      output: fi,
      terminal: true,
      completer: mustCall(() => Promise.reject(new Error("message"))),
    });

    rli.on("line", mustNotCall());
    fi.emit("data", "\t");
    const outCheckDone = createDone();
    process.nextTick(() => {
      console.log("output", fi.output);
      assert.match(fi.output, /^Tab completion error/);
      fi.reset();
      outCheckDone();
    });
    rli.close();
  });
});
