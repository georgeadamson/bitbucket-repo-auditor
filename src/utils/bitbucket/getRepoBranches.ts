export default async function getRepoBranches(project: string, repo: string) {
  const result = { values: [], size: 0 };
  let nextPageUrl = `https://bitbucket.org/!api/2.0/repositories/${project}/${repo}/refs/branches?pagelen=100`;

  console.groupCollapsed('getRepoBranches', repo);

  // Fetch all the branches, 100 at a time:
  while (nextPageUrl) {
    const response = await fetch(nextPageUrl, { credentials: 'include' });
    const json = await response.json();

    nextPageUrl = json.next;
    result.size = json.size;

    Array.prototype.push.apply(result.values, json.values);
  }

  console.groupEnd();

  return result;
}
