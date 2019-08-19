// Bookmarklet to inject d2-repo-tools into a repo page.
// Inspired by https://unpkg.com/browse/d2-bitbucket-repo-component-audit/dist/d2-repo-tools.js

javascript: (function(doc) {
  var url =
    'https://unpkg.com/d2-bitbucket-repo-component-audit/dist/d2-repo-tools';

  // For modern browsers:
  var elem = doc.createElement('script');
  elem.setAttribute('type', 'module');
  elem.src = url + '/d2-repo-tools.esm.js';
  doc.head.appendChild(elem);

  // For older browsers:
  elem = doc.createElement('script');
  elem.setAttribute('nomodule', '');
  elem.src = url + '/d2-repo-tools.js';
  doc.head.appendChild(elem);

  // Inject our custom component:
  elem = doc.createElement('d2-audit');
  doc.body.appendChild(elem);
})(document);
