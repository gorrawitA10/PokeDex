import axios from "axios";
import { Pokemon } from "../model/pokeData/pokeData";

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

export { fetchPokemons };
