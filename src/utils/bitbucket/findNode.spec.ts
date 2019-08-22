import findNode from './findNode';

const DEMO_TREE_ARRAY_OF_BRANDS = [
  {
    type: 'directory',
    name: 'brand1',
    contents: []
  },
  {
    type: 'directory',
    name: 'brand2',
    contents: []
  },
  {
    type: 'directory',
    name: 'brand3',
    contents: []
  }
];

const DEMO_TREE_APP_NODE = {
  type: 'directory',
  name: 'app',
  contents: DEMO_TREE_ARRAY_OF_BRANDS
};

const DEMO_TREE = [
  {
    type: 'directory',
    name: '.',
    contents: [
      {
        type: 'directory',
        name: 'unilever-platform',
        contents: [DEMO_TREE_APP_NODE, DEMO_TREE_APP_NODE]
      }
    ]
  }
];

describe('findNode', () => {
  it('should find node by name `app`', () => {
    expect(findNode(DEMO_TREE, 'app')).toMatchObject(DEMO_TREE_APP_NODE);
  });

  it('should find node by path `unilever-platform/app`', () => {
    expect(findNode(DEMO_TREE, 'unilever-platform/app')).toMatchObject(
      DEMO_TREE_APP_NODE
    );
  });

  it('should find brand node by path `unilever-platform/app/brand2`', () => {
    expect(findNode(DEMO_TREE, 'unilever-platform/app/brand2')).toMatchObject(
      DEMO_TREE_APP_NODE.contents[1]
    );
  });
});
