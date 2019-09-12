import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'd2-repo-tools',
  plugins: [sass()],
  // globalScript: 'src/global/app.ts',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [{ src: 'bookmarklet.js' }]
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      baseUrl: 'http://www.demo.com',
      serviceWorker: null // disable service workers
    }
  ]
};
