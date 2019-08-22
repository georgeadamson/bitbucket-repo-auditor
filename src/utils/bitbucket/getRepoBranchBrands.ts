import getRepoBranch from './getRepoBranch';

export default async function getRepoBranchBrands(repo, branch) {
  // First we need the unique hash for the branch's file tree:
  const branchJson = await getRepoBranch(repo, branch);
  const hash = branchJson.target.hash;

  let nextPageUrl = `https://bitbucket.org/!api/internal/repositories/d2_website_repositories/${repo}/tree/${hash}/?no_size=1`;

  const response = await fetch(nextPageUrl);
  const result = await response.json();

  return result.contents.find();
}
