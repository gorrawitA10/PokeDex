import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Modal,
  Pagination,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  fetchPokemons,
  fetchAbilities,
  fetchPokemonMoves,
} from "../../service/poke";
import {
  Pokemon,
  ElementIcons,
  Ability,
  Move,
} from "../../model/pokeData/pokeData";
import "./mainStyle.css";

const ITEMS_PER_PAGE = 18;

const typeColors: { [key: string]: string } = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

const elementIcons: ElementIcons = {
  normal: "🔘",
  fire: "🔥",
  water: "💧",
  electric: "⚡",
  grass: "🌿",
  ice: "❄️",
  fighting: "🥊",
  poison: "☠️",
  ground: "⛰️",
  flying: "🦅",
  psychic: "🔮",
  bug: "🐛",
  rock: "🪨",
  ghost: "👻",
  dragon: "🐉",
  dark: "⚫",
  steel: "🔩",
  fairy: "🧚",
};

function MainContent() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredPokemon, setHoveredPokemon] = useState<Pokemon | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPageInput, setCurrentPageInput] = useState<number>(currentPage);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const pokemonData = await fetchPokemons();
      setPokemons(pokemonData);
    };
    fetchData();
  }, []);

  const totalPages = Math.ceil(pokemons.length / ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handleMouseEnter = (pokemon: Pokemon) => {
    setHoveredPokemon(pokemon);
  };

  const handleMouseLeave = () => {
    setHoveredPokemon(null);
  };

  const handlePokemonClick = async (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    const abilities = await fetchAbilities(pokemon.name);
    setAbilities(abilities);
    const moves = await fetchPokemonMoves(pokemon.name);
    setMoves(moves);
  };

  const handleTypeClick = (type: string | null) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const getBackgroundColor = (type: string) => {
    return hoveredPokemon &&
      hoveredPokemon.types.some((t) => t.type.name === type)
      ? typeColors[type]
      : "transparent";
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setCurrentPage(1);
  };

  const handleGoToPage = () => {
    if (currentPageInput >= 1 && currentPageInput <= totalPages) {
      setCurrentPage(currentPageInput);
    }
  };

  const filteredPokemons = pokemons.filter((pokemon) => {
    const matchesName = pokemon.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = selectedType
      ? pokemon.types.some((type) => type.type.name === selectedType)
      : true;
    return matchesName && matchesType;
  });

  const displayedPokemons = filteredPokemons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPagesFiltered = Math.ceil(
    filteredPokemons.length / ITEMS_PER_PAGE
  );

  const renderModal = () => {
    return (
      <Modal
        show={selectedPokemon !== null}
        onHide={() => setSelectedPokemon(null)}
        size="lg"
      >
        {selectedPokemon && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedPokemon.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex justify-content-center mb-3">
                <img
                  src={
                    selectedPokemon.sprites.other["official-artwork"]
                      .front_default
                  }
                  alt={selectedPokemon.name}
                  style={{
                    width: "200px",
                    height: "200px",
                    objectFit: "contain",
                  }}
                />
              </div>
              <Tabs defaultActiveKey="types" id="pokemon-details-tabs">
                <Tab eventKey="types" title="Types">
                  <div>
                    <strong>Types: </strong>
                    {selectedPokemon.types.map((type, index) => (
                      <span key={index} style={{ fontSize: "1.5rem" }}>
                        {elementIcons[type.type.name]}
                      </span>
                    ))}
                  </div>
                </Tab>
                <Tab eventKey="abilities" title="Abilities">
                  <div>
                    <strong>Abilities: </strong>
                    <ul>
                      {abilities.map((ability, index) => (
                        <li key={index}>{ability.name}</li>
                      ))}
                    </ul>
                  </div>
                </Tab>
                <Tab eventKey="moves" title="Moves">
                  <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <strong>Moves: </strong>
                    <ul>
                      {moves.map((move, index) => (
                        <li key={index}>{move.name}</li>
                      ))}
                    </ul>
                  </div>
                </Tab>
                <Tab eventKey="stats" title="Stats">
                  <div>
                    <strong>Base Stats:</strong>
                    <table className="table table-striped">
                      <tbody>
                        {selectedPokemon.stats.map((stat, index) => (
                          <tr key={index}>
                            <td>{stat.stat.name}</td>
                            <td>{stat.base_stat}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Tab>
              </Tabs>
            </Modal.Body>
          </>
        )}
      </Modal>
    );
  };

  return (
    <div>
      <Container>
        <Form className="d-flex mb-3" onSubmit={handleSearchSubmit}>
          <Form.Control
            type="search"
            placeholder="Search"
            className="me-2"
            aria-label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <Form.Select
            className="me-2"
            onChange={(e) => handleTypeClick(e.target.value || null)}
          >
            <option value="">All Types</option>

            {Object.keys(elementIcons).map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </Form.Select>
        </Form>
        {[...Array(Math.ceil(displayedPokemons.length / 6))].map(
          (_, rowIndex) => (
            <Row key={rowIndex} className="mb-3 gap-3">
              {displayedPokemons
                .slice(rowIndex * 6, rowIndex * 6 + 6)
                .map((pokemon, colIndex) => (
                  <Col
                    key={colIndex}
                    className="fixed-size border d-flex flex-column align-items-center justify-content-center border-con"
                    style={{
                      backgroundColor:
                        hoveredPokemon && pokemon.name === hoveredPokemon.name
                          ? getBackgroundColor(pokemon.types[0].type.name)
                          : "transparent",
                    }}
                    onMouseEnter={() => handleMouseEnter(pokemon)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handlePokemonClick(pokemon)}
                  >
                    <img
                      src={
                        pokemon.sprites.other["official-artwork"].front_default
                      }
                      alt={pokemon.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "contain",
                      }}
                    />
                    <div>{pokemon.name}</div>
                    <div>
                      {pokemon.types.map((type, index) => (
                        <span key={index} style={{ fontSize: "1.5rem" }}>
                          {elementIcons[type.type.name]}
                        </span>
                      ))}
                    </div>
                  </Col>
                ))}
            </Row>
          )
        )}
        {totalPagesFiltered > 1 && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Pagination>
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              />
              {[...Array(Math.min(totalPagesFiltered, 5))].map((_, index) => {
                const page = currentPage - 2 + index + 1;
                if (page >= 1 && page <= totalPagesFiltered) {
                  return (
                    <Pagination.Item
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      active={currentPage === page}
                    >
                      {page}
                    </Pagination.Item>
                  );
                }
                return null;
              })}
              <Pagination.Next
                onClick={handleNextPage}
                disabled={currentPage === totalPagesFiltered}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPagesFiltered)}
                disabled={currentPage === totalPagesFiltered}
              />
            </Pagination>
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleGoToPage();
              }}
              className="d-flex"
            >
              <Form.Group className="mb-0 me-2">
                <Form.Control
                  type="number"
                  min={1}
                  max={totalPagesFiltered}
                  value={currentPageInput}
                  onChange={(e) =>
                    setCurrentPageInput(parseInt(e.target.value))
                  }
                />
              </Form.Group>
              <Button type="submit">Go</Button>
            </Form>
          </div>
        )}
      </Container>
      {renderModal()}
    </div>
  );
}

export default MainContent;
