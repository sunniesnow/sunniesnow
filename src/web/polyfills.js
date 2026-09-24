// Polyfills needed by the browsers the web build supports (Chromium 37 and later).
// The library build does not include them: consumers bundle the library themselves
// and are expected to provide the polyfills their own target needs.
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'whatwg-fetch';
