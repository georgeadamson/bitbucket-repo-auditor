// Eg: https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/axe/refs/branches/develop

export default async function getRepoBranch(repo, branch) {
  let url = `https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/${repo}/refs/branches/${branch}`;

  const response = await fetch(url);
  const result = await response.json();

  return result;
}
