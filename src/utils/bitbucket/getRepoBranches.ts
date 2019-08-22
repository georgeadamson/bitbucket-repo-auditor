export default async function getRepoBranches(repo) {
  const result = { values: [], size: 0 };
  let nextPageUrl = `https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/${repo}/refs/branches?pagelen=100`;

  // Fetch all the branches, 100 at a time:
  while (nextPageUrl) {
    const response = await fetch(nextPageUrl);
    const json = await response.json();

    nextPageUrl = json.next;
    result.size = json.size;

    Array.prototype.push.apply(result.values, json.values);
  }

  return result;
}
