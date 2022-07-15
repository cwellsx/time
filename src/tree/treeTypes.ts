export interface INode {
  readonly key: string;
  readonly parent: string | null;
  readonly children: INode[];
  render(): React.ReactNode;
  readonly type: string;
}

export type GetParent = (child: string) => string | null;
export type SetParent = (child: string, parent: string) => void;
export type IsAncestor = (child: string, parent: string) => boolean;
