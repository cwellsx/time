export interface INode {
  readonly key: string;
  readonly parent: string | null;
  readonly children: INode[];
  readonly type: string;
  render(): React.ReactNode;
  isDescendantOf(other: string): boolean;
}

export type GetParent = (child: string) => string | null;
export type SetParent = (child: string, parent: string | null, isDrop: boolean) => void;
