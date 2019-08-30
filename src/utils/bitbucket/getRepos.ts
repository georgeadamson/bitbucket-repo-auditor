export default async function getRepos(project: string) {
  const result = { values: [], size: 0 };
  let nextPageUrl = `https://bitbucket.org/!api/2.0/repositories/${project}?pagelen=100`;

  console.groupCollapsed('getRepos');

  // Fetch all the repos, 100 at a time:
  while (nextPageUrl) {
    console.log('getRepos', nextPageUrl);
    const response = await fetch(nextPageUrl, { credentials: 'include' });
    const json = await response.json();

    console.log('getRepos', json);
    nextPageUrl = json.next;
    result.size = json.size;

    Array.prototype.push.apply(result.values, json.values);
  }

  console.groupEnd();

  return result;
}
