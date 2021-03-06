// Eg: https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/axe/refs/branches/develop

export default async function getRepoBranch(project, repo, branch) {
  let url = `https://bitbucket.org/!api/2.0/repositories/${project}/${repo}/refs/branches/${branch}`;

  console.groupCollapsed('getRepoBranch', project, repo, branch);

  const response = await fetch(url, { credentials: 'include' });
  const result = await response.json();

  console.groupEnd();

  return result;
}
