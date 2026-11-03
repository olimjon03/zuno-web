import { registerHooks } from 'node:module';
// Next resolves extensionless TS modules and consumes environment markers at build time.
// Native Node tests exercise helpers/adapters; the actual Next build enforces boundaries.
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'server-only' || specifier === 'client-only') return { url: 'data:text/javascript,export{}', shortCircuit: true };
    try { return next(specifier, context); }
    catch (error) {
      if (specifier.startsWith('.') && error.code === 'ERR_MODULE_NOT_FOUND') return next(specifier + '.ts', context);
      throw error;
    }
  },
});
