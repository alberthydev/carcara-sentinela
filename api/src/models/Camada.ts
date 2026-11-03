export const CAMADAS_INSTITUICAO = [1, 2] as const;

export type CamadaInstituicao = (typeof CAMADAS_INSTITUICAO)[number];

export const isCamadaInstituicao = (value: unknown): value is CamadaInstituicao =>
  value === 1 || value === 2;
