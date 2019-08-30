const BITBUCKET_HOST = 'bitbucket.org';

// Helper to derive the repo name and branch from the current url:
// Eg: When browser url is "https://bitbucket.org/d2_website_repositories/timotei/src/develop/unilever-platform/"
//     return { repo: "timotei", branch: "develop" }
export default function getRepoName(project: string) {
  // Regex returns an array like:
  // [ "d2_website_repositories/timotei/src/develop", "timotei", "develop" ]
  const regexp = new RegExp(project + '/([^/]+)/src/([^/]+)');
  const isLocalhost = location.hostname === 'localhost';
  const isBitbucket = location.hostname === BITBUCKET_HOST;
  const [, repo, branch] = (location.href.match(regexp) || []) as string[];
  const isValidRepo = !!(isBitbucket && repo && branch);

  return {
    isLocalhost,
    isBitbucket,
    isValidRepo,
    repo,
    branch
  };
}
