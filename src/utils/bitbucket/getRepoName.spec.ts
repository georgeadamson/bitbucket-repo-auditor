import getRepoName from './getRepoName';

declare global {
  namespace NodeJS {
    interface Global {
      location: { href: string };
    }
  }
}

describe('getRepoName', () => {
  it('should detect when url is not bitbucket.org', () => {
    global.location = { href: 'https://www.bbc.co.uk' };

    expect(getRepoName()).toMatchObject({
      isBitbucket: false,
      isValidRepo: false,
      repo: undefined,
      branch: undefined
    });
  });

  it('should detect when url does not include repo and branch name', () => {
    global.location = {
      href: 'https://bitbucket.org/d2_website_repositories/'
    };
    expect(getRepoName()).toMatchObject({
      isBitbucket: true,
      isValidRepo: false,
      repo: undefined,
      branch: undefined
    });
  });

  it('should return repo name and branch from valid bitbucket repo url', () => {
    global.location = {
      href:
        'https://bitbucket.org/d2_website_repositories/demoRepo/src/demoBranch/unilever-platform/'
    };

    expect(getRepoName()).toMatchObject({
      isBitbucket: true,
      isValidRepo: true,
      repo: 'demoRepo',
      branch: 'demoBranch'
    });
  });
});