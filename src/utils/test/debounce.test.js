import { expect } from '@open-wc/testing';
import { debounce } from '../debounce.js';

describe('debounce utils', () => {
  async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  describe('debounce', () => {
    let counter;

    function log() {
      counter += 1;
    }

    beforeEach(() => {
      counter = 0;
    });

    it('should let a regular function execute freely', async () => {
      const interval = setInterval(log);
      await wait(1000);
      clearInterval(interval);

      expect(counter).to.be.greaterThan(200);
    });

    it('should debounce a function', async () => {
      const debouncedLog = debounce(log);
      const interval = setInterval(debouncedLog);
      await wait(1000);
      clearInterval(interval);

      expect(counter).to.be.greaterThan(50);
      expect(counter).to.be.lessThan(70);
    });

    it('should preserve "this" context when returning a debounced function', async () => {
      const TestClass = new (class Test {
        constructor() {
          this.counter = 0;
          this.log = debounce(this.log).bind(this);
        }

        log() {
          this.counter += 1;
        }
      })();

      const debouncedLogWithContext = debounce(TestClass.log);
      const interval = setInterval(debouncedLogWithContext);
      await wait(1000);
      clearInterval(interval);

      expect(TestClass.counter).to.be.greaterThan(50);
      expect(TestClass.counter).to.be.lessThan(70);
    });
  });
});
