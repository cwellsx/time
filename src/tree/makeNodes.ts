import { INode } from './node';

class NodeT<T> implements INode {
  private readonly data: T;
  private readonly renderT: (item: T) => React.ReactNode;
  readonly key: string;
  readonly parent: INode | null;
  readonly children: INode[];

  render(): React.ReactNode {
    return this.renderT(this.data);
  }

  constructor(data: T, key: string, renderT: (item: T) => React.ReactNode) {
    this.data = data;
    this.renderT = renderT;
    this.key = key;
    this.parent = null;
    this.children = [];
  }
}

export function makeNodes<T>(
  data: T[],
  getKey: (item: T) => string,
  render: (item: T) => React.ReactNode,
  getParent: (key: string) => string | null
): INode[] {
  const nodes: INode[] = data.map((data) => new NodeT(data, getKey(data), render));
  console.log("makeTree nodes: " + JSON.stringify(nodes, ["key", "children"]));

  const dictionary: { [index: string]: INode } = {};
  for (const node of nodes) dictionary[node.key] = node;

  const tree: INode[] = [];
  for (const node of nodes) {
    const parentKey = getParent(node.key);
    if (parentKey === null) tree.push(node);
    else {
      const parent = dictionary[parentKey];
      node.parent = parent;
      parent.children.push(node);
    }
  }

  console.log(`makeTree tree` + JSON.stringify(tree, ["key", "children"]));
  return tree;
}

type Data = { key: string };
const data: Data[] = [{ key: "foo" }, { key: "bar1" }];
const getParent = (key: string) => {
  switch (key) {
    case "foo":
      return "bar1";
    default:
      return null;
  }
};
const render = (item: Data): React.ReactNode => item.key;

export function makeSampleTree(): INode[] {
  const foo = 2;
  return makeNodes(data, (item) => item.key, render, getParent);
}
