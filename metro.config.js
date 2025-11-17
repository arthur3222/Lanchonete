const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Caminhos dos shims
const SHIM_ETH = path.resolve(projectRoot, 'shims/supabase-ethereum.js');
const SHIM_WEBAUTHN = path.resolve(projectRoot, 'shims/supabase-webauthn.js');
const SHIM_VECTORS = path.resolve(projectRoot, 'shims/supabase-vectors.js');

// Aliases diretos (quando o import já vier “absoluto”)
config.resolver = config.resolver || {};
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  // @supabase/auth-js (main e module)
  '@supabase/auth-js/dist/main/lib/web3/ethereum': SHIM_ETH,
  '@supabase/auth-js/dist/main/lib/webauthn': SHIM_WEBAUTHN,
  '@supabase/auth-js/dist/module/lib/web3/ethereum': SHIM_ETH,
  '@supabase/auth-js/dist/module/lib/webauthn': SHIM_WEBAUTHN,
  // @supabase/storage-js
  '@supabase/storage-js/dist/main/lib/vectors': SHIM_VECTORS,
  '@supabase/storage-js/dist/module/lib/vectors': SHIM_VECTORS,
};

// resolveRequest para capturar imports relativos dentro dos pacotes
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const origin = context?.originModulePath || '';

  // auth-js: quando o require é relativo (./lib/web3/ethereum ou ./lib/webauthn)
  if (
    origin.includes('@supabase/auth-js/dist/main/') ||
    origin.includes('@supabase/auth-js/dist/module/')
  ) {
    if (moduleName === './lib/web3/ethereum') {
      return { filePath: SHIM_ETH, type: 'sourceFile' };
    }
    if (moduleName === './lib/webauthn') {
      return { filePath: SHIM_WEBAUTHN, type: 'sourceFile' };
    }
  }

  // storage-js: quando o require é relativo (./lib/vectors)
  if (
    origin.includes('@supabase/storage-js/dist/main/') ||
    origin.includes('@supabase/storage-js/dist/module/')
  ) {
    if (moduleName === './lib/vectors') {
      return { filePath: SHIM_VECTORS, type: 'sourceFile' };
    }
  }

  // fallback para o resolvedor padrão (ou o original, se existir)
  if (typeof originalResolveRequest === 'function') {
    return originalResolveRequest(context, moduleName, platform);
  }
  return require('metro-resolver').resolve(context, moduleName, platform);
};

module.exports = config;
