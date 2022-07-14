export interface INode {
  readonly key: string;
  readonly children: INode[];
  render(): React.ReactNode;
  readonly type: string;
}
