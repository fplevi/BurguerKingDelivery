import { defineConfig } from 'vite';

// The 3D part (Three.js + src/scene) goes in its own chunk, so its weight can be measured
// against the budget (tests/orcamento.spec.js) and cached apart from the page code.
export default defineConfig({
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [{ name: 'burger-3d', test: /node_modules[\/]three[\/]|src[\/]scene[\/]/ }],
        },
      },
    },
  },
});
