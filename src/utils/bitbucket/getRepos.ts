export default async function getRepos() {
  const result = { values: [], size: 0 };
  let nextPageUrl =
    'https://bitbucket.org/!api/2.0/repositories/d2_website_repositories?pagelen=100';

  // Fetch all the repos, 100 at a time:
  while (nextPageUrl) {
    const response = await fetch(nextPageUrl);
    const json = await response.json();

    nextPageUrl = json.next;
    result.size = json.size;

    Array.prototype.push.apply(result.values, json.values);
  }

  return result;
}
