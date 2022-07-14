import type { INode } from "./node";

class NodeT<T> implements INode {
  private readonly data: T;
  private readonly renderT: (item: T) => React.ReactNode;
  readonly key: string;
  readonly type: string;
  readonly parent: INode | null;
  readonly children: INode[];

  render(): React.ReactNode {
    return this.renderT(this.data);
  }

  constructor(data: T, key: string, type: string, renderT: (item: T) => React.ReactNode) {
    this.data = data;
    this.renderT = renderT;
    this.key = key;
    this.type = type;
    this.parent = null;
    this.children = [];
  }
}

export function makeNodes<T>(
  data: T[],
  getKey: (item: T) => string,
  render: (item: T) => React.ReactNode,
  getParent: (key: string) => string | null,
  getType: (item: T) => string
): INode[] {
  const nodes: INode[] = data.map((data) => new NodeT(data, getKey(data), getType(data), render));

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

  return tree;
}
