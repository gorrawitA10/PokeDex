import axios from "axios";
import { Pokemon, Ability, Move } from "../model/pokeData/pokeData";

const fetchPokemons = async () => {
  try {
    const response = await axios.get(
      "https://pokeapi.co/api/v2/pokemon?limit=10000"
    );
    const pokemonList = response.data.results;
    const promises = pokemonList.map((pokemon: { url: string }) =>
      axios.get(pokemon.url)
    );
    const results = await Promise.all(promises);
    return results.map((result) => result.data);
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    return [] as Pokemon[];
  }
};

const fetchAbilities = async (pokemonName: string): Promise<Ability[]> => {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const abilities = response.data.abilities;
    return abilities.map((ability: { ability: { name: string } }) => ({
      name: ability.ability.name,
    }));
  } catch (error) {
    console.error(`Error fetching abilities for ${pokemonName}:`, error);
    return [];
  }
};

const fetchPokemonMoves = async (pokemonName: string): Promise<Move[]> => {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const moves = response.data.moves;
    return moves.map((move: { move: { name: string } }) => ({
      name: move.move.name,
    }));
  } catch (error) {
    console.error(`Error fetching moves for ${pokemonName}:`, error);
    return [];
  }
};

export { fetchPokemons, fetchAbilities, fetchPokemonMoves };
