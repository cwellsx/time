import type { INode, GetParent } from "./treeTypes";

class NodeT<T> implements INode {
  private readonly data: T;
  readonly key: string;
  readonly parent: string | null;
  readonly children: INode[];
  readonly type: string;
  private readonly renderT: (item: T) => React.ReactNode;
  readonly isDescendantOf: (other: string) => boolean;

  render(): React.ReactNode {
    return this.renderT(this.data);
  }

  constructor(
    data: T,
    key: string,
    parent: string | null,
    type: string,
    renderT: (item: T) => React.ReactNode,
    isDescendantOf: (other: string) => boolean
  ) {
    this.data = data;
    this.key = key;
    this.parent = parent;
    this.type = type;
    this.children = [];
    this.renderT = renderT;
    this.isDescendantOf = isDescendantOf;
  }
}

export function makeTree<T>(
  data: T[],
  getKey: (item: T) => string,
  render: (item: T) => React.ReactNode,
  getParent: GetParent,
  getType: (item: T) => string
): INode[] {
  function isDescendant(child: string, other: string): boolean {
    for (let parent = getParent(child); parent != null; parent = getParent(parent)) {
      if (parent === other) return true;
    }
    return false;
  }

  const nodes: INode[] = data.map((data) => {
    const key = getKey(data);
    const parent = getParent(key);
    return new NodeT(data, key, parent, getType(data), render, (other: string) => isDescendant(key, other));
  });

  const dictionary: { [index: string]: INode } = {};
  for (const node of nodes) dictionary[node.key] = node;

  const tree: INode[] = [];
  for (const node of nodes) {
    const parentKey = node.parent;
    const siblings = parentKey === null ? tree : dictionary[parentKey].children;
    siblings.push(node);
  }

  return tree;
}
