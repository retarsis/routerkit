import { mergeRouteTrees } from './merge-route-trees';
import { RouteTree } from './interfaces';

describe('mergeRouteTrees test', () => {
  test('should return expected tree 1', () => {
    const left: RouteTree = {
      ROOT: {
        test: {
          test1: {}
        }
      }
    };

    const right: RouteTree = {
      ROOT: {
        test: {}
      }
    };

    expect(mergeRouteTrees(left, right)).toEqual(left);
    expect(mergeRouteTrees(right, left)).toEqual(left);
  });

  test('should return expected tree 2', () => {
    const left: RouteTree = {
      ROOT: {
        test: {
          test1: {}
        }
      }
    };

    const right: RouteTree = {
      ROOT2: {
        test: {
          test1: {}
        }
      }
    };

    const expectedTree = {
      ROOT: {
        test: {
          test1: {}
        }
      },
      ROOT2: {
        test: {
          test1: {}
        }
      }
    };

    expect(mergeRouteTrees(left, right)).toEqual(expectedTree);
    expect(mergeRouteTrees(right, left)).toEqual(expectedTree);
  });

  test('should return expected tree 4', () => {
    const left: RouteTree = {
      ROOT: {
        test: {
          test1: {}
        }
      },
      ROOT2: {
        deepProp: {
          deepProp2: {}
        }
      }
    };

    const right: RouteTree = {
      ROOT2: {
        test: {
          test1: {}
        }
      }
    };

    const expectedTree = {
      ROOT: {
        test: {
          test1: {}
        }
      },
      ROOT2: {
        test: {
          test1: {}
        },
        deepProp: {
          deepProp2: {}
        }
      }
    };

    expect(mergeRouteTrees(left, right)).toEqual(expectedTree);
    expect(mergeRouteTrees(right, left)).toEqual(expectedTree);
  });
});
