// Archivo: /app/types/nodes.ts

export type NodeType = 'CESFAM' | 'Transporte' | 'Laboratorio';

export interface Node {
  type: NodeType;
  identifier: string;
  displayName: string;
}