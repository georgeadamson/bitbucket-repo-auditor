const BITBUCKET_HOST = 'https://bitbucket.org';
const BITBUCKET_ROOT = 'd2_website_repositories';

// Helper to derive the repo name and branch from the current url:
// Eg: When browser url is "https://bitbucket.org/d2_website_repositories/timotei/src/develop/unilever-platform/"
//     return { repo: "timotei", branch: "develop" }
export default function getRepoName() {
  // Regex returns an array like:
  // [ "d2_website_repositories/timotei/src/develop", "timotei", "develop" ]

  const isBitbucket = new RegExp(BITBUCKET_HOST).test(location.href);

  const urlMatches =
    location.href.match(new RegExp(BITBUCKET_ROOT + '/([^/]+)/src/([^/]+)')) ||
    [];

  return {
    isBitbucket,
    isValidRepo: isBitbucket && urlMatches.length === 3,
    repo: urlMatches[1],
    branch: urlMatches[2]
  };
}
