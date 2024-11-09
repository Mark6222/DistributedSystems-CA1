import {Game} from '../shared/types'
import { GameCompany } from '../shared/types';

export const games : Game[] = [
  {
    id: 1,
    title: "The Last of Us Part II",
    releaseYear: 2020,
    genre: "Action-Adventure",
    description: "Ellie returns in a revenge story chasing down the people who hurt her and her freinds"
  },
  {
    id: 2,
    title: "Red Dead Redemption 2",
    releaseYear: 2018,
    genre: "Action-Adventure",
    description: "An open-world Western adventure that follows outlaw Arthur Morgan and his gang"
  },
  {
    id: 3,
    title: "Horizon Forbidden West",
    releaseYear: 2022,
    genre: "Action RPG",
    description: "Aloy returns to explore the Western United States"
  },
  {
    id: 4,
    title: "Ghost of Tsushima",
    releaseYear: 2020,
    genre: "Action-Adventure",
    description: "Set in feudal Japan, players follow samurai Jin Sakai as he fights to protect his homeland"
  },
  {
    id: 5,
    title: "Elden Ring",
    releaseYear: 2022,
    genre: "Action RPG",
    description: "An epic fantasy adventure from the creators of Dark Souls"
  },
  {
    id: 6,
    title: "Spider-Man: Miles Morales",
    releaseYear: 2020,
    genre: "Action",
    description: "Players step into the role of Miles Morales as he learns to become his own Spider-Man"
  },
];
export const gameCompanies: GameCompany[] = [
  {
    gameId: 1,
    companyName: "Naughty Dog",
    founder: "Andy Gavin",
    companyDescription: "Renowned for creating cinematic action-adventure games",
  },
  {
    gameId: 2,
    companyName: "Rockstar Games",
    founder: "Sam Houser",
    companyDescription: "Famous for open-world titles",
  },
  {
    gameId: 3,
    companyName: "Guerrilla Games",
    founder: "Arjan Brussee",
    companyDescription: "Dutch studio known for its unique blend of action and role-playing",
  },
  {
    gameId: 4,
    companyName: "Sucker Punch Productions",
    founder: "Brian Fleming",
    companyDescription: "Seattle-based studio specializing in action games",
  },
  {
    gameId: 5,
    companyName: "FromSoftware",
    founder: "Naotoshi Zin",
    companyDescription: "Dark fantasy games with deep lore and open-world exploration",
  },
  {
    gameId: 6,
    companyName: "Insomniac Games",
    founder: "Ted Price",
    companyDescription: "Insomniac has set a high standard for action games and storytelling",
  },
];