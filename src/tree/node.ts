export interface INode {
  key: string;
  parent: INode | null;
  children: INode[];
  render(): React.ReactNode;
}
