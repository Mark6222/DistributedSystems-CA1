export type Game =   {
  id: number,
  title: string;
  releaseYear: number;
  genre: string;
  description: string;
}

export type GameCompany = {
  gameId: number;
  companyName: string;
  founder: string;
  companyDescription: string;
};

export type GameCompanyQueryParams = {
  gameId: string;
  companyName?: string;
  founder?: string;
}