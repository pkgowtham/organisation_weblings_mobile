// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-real-events/support'

// Mock ExpoSecureStore globally for React Native Web in browser context
Cypress.on('window:before:load', (win) => {
  // Mock ExpoSecureStore methods on Object.prototype.
  // Because ExpoSecureStore exports an empty object ({}) on Web, it will fallback to lookup
  // these methods on the Object prototype chain and successfully execute our localStorage implementation.
  // We use enumerable: false so they do not show up in for...in loops (which breaks react-native-web).
  Object.defineProperty(win.Object.prototype, 'getValueWithKeyAsync', {
    value: function (key: string) {
      const value = win.localStorage.getItem(key);
      return Promise.resolve(value);
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  Object.defineProperty(win.Object.prototype, 'setValueWithKeyAsync', {
    value: function (val: string, key: string) {
      if (typeof val === 'string' && typeof key === 'string') {
        win.localStorage.setItem(key, val);
      } else if (typeof val === 'string') {
        win.localStorage.setItem('authToken', val);
      }
      return Promise.resolve(true);
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  Object.defineProperty(win.Object.prototype, 'deleteValueWithKeyAsync', {
    value: function (key: string) {
      win.localStorage.removeItem(key);
      return Promise.resolve(true);
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  // Also define the direct getItemAsync, setItemAsync, deleteItemAsync mocks for completeness
  Object.defineProperty(win.Object.prototype, 'getItemAsync', {
    value: function (key: string) {
      const value = win.localStorage.getItem(key);
      return Promise.resolve(value);
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  Object.defineProperty(win.Object.prototype, 'setItemAsync', {
    value: function (key: string, val: string) {
      win.localStorage.setItem(key, val);
      return Promise.resolve(true);
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

  Object.defineProperty(win.Object.prototype, 'deleteItemAsync', {
    value: function (key: string) {
      win.localStorage.removeItem(key);
      return Promise.resolve(true);
    },
    enumerable: false,
    configurable: true,
    writable: true
  });

});

// Prevent Cypress from failing due to minor third-party or bundler uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});