import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Modal,
  Pagination,
  Row,
  Spinner,
  Tab,
  Tabs,
} from "react-bootstrap";
import {
  fetchPokemons,
  fetchAbilities,
  fetchPokemonMoves,
} from "../../service/poke";
import { Ability, Move, Pokemon } from "../../model/pokeData/pokeData";
import "./mainStyle.css";

const ITEMS_PER_PAGE = 18;

const typeColors: Record<string, string> = {
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

const typeShort: Record<string, string> = {
  normal: "NRM",
  fire: "FIR",
  water: "WTR",
  electric: "ELC",
  grass: "GRS",
  ice: "ICE",
  fighting: "FIG",
  poison: "PSN",
  ground: "GND",
  flying: "FLY",
  psychic: "PSY",
  bug: "BUG",
  rock: "RCK",
  ghost: "GST",
  dragon: "DRG",
  dark: "DRK",
  steel: "STL",
  fairy: "FRY",
};

type PokemonDetails = {
  abilities: Ability[];
  moves: Move[];
};

function getErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected error occurred";
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export default function MainContent() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [moves, setMoves] = useState<Move[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");

  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageInput, setCurrentPageInput] = useState<number>(1);

  const detailsCacheRef = useRef<Map<string, PokemonDetails>>(new Map());
  const lastRequestedNameRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setListLoading(true);
        setListError(null);
        const data = await fetchPokemons();
        if (!mounted) return;
        setPokemons(data);
      } catch (err: unknown) {
        if (!mounted) return;
        setListError(getErrorMessage(err));
      } finally {
        if (mounted) setListLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const allTypes = useMemo(() => Object.keys(typeColors), []);

  const filteredPokemons = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return pokemons.filter((p) => {
      const matchesName = q ? p.name.toLowerCase().includes(q) : true;
      const matchesType = selectedType
        ? p.types.some((t) => t.type.name === selectedType)
        : true;
      return matchesName && matchesType;
    });
  }, [pokemons, searchTerm, selectedType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPokemons.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  useEffect(() => {
    setCurrentPageInput(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const displayedPokemons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPokemons.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPokemons, currentPage]);

  const goToPage = (page: number) => {
    const safe = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safe);
  };

  const openPokemon = async (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
    setDetailsError(null);

    const cached = detailsCacheRef.current.get(pokemon.name);
    if (cached) {
      setAbilities(cached.abilities);
      setMoves(cached.moves);
      return;
    }

    lastRequestedNameRef.current = pokemon.name;

    try {
      setDetailsLoading(true);
      const [ab, mv] = await Promise.all([
        fetchAbilities(pokemon.name),
        fetchPokemonMoves(pokemon.name),
      ]);

      if (lastRequestedNameRef.current !== pokemon.name) return;

      const details: PokemonDetails = { abilities: ab, moves: mv };
      detailsCacheRef.current.set(pokemon.name, details);
      setAbilities(ab);
      setMoves(mv);
    } catch (err: unknown) {
      if (lastRequestedNameRef.current !== pokemon.name) return;
      setDetailsError(getErrorMessage(err));
      setAbilities([]);
      setMoves([]);
    } finally {
      if (lastRequestedNameRef.current === pokemon.name)
        setDetailsLoading(false);
    }
  };

  const renderTypePills = (types: string[]) => (
    <div className="type-badges">
      {types.map((t) => (
        <span
          key={t}
          className="type-pill"
          style={{ backgroundColor: typeColors[t] ?? "#999" }}
        >
          <span className="type-chip">
            {typeShort[t] ?? t.slice(0, 3).toUpperCase()}
          </span>
          <span className="type-label">{cap(t)}</span>
        </span>
      ))}
    </div>
  );

  const renderPager = () => {
    if (totalPages <= 1) return null;

    const windowSize = 5;
    const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);

    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);

    return (
      <div className="pager">
        <Pagination className="mb-0">
          <Pagination.First
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {pages.map((p) => (
            <Pagination.Item
              key={p}
              active={p === currentPage}
              onClick={() => goToPage(p)}
            >
              {p}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
          <Pagination.Last
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
          />
        </Pagination>

        <Form
          className="pager-form"
          onSubmit={(e) => {
            e.preventDefault();
            goToPage(currentPageInput);
          }}
        >
          <Form.Control
            className="page-input"
            type="number"
            min={1}
            max={totalPages}
            value={currentPageInput}
            onChange={(e) => setCurrentPageInput(Number(e.target.value))}
          />
          <Button type="submit">Go</Button>
        </Form>
      </div>
    );
  };

  return (
    <Container className="pb-4">
      <div className="topbar">
        <div>
          <div className="title">Pokédex</div>
          <div className="subtitle">
            Search, filter by type, and view details.
          </div>
        </div>
      </div>

      <Form className="filters" onSubmit={(e) => e.preventDefault()}>
        <Form.Control
          type="search"
          placeholder="Search Pokémon"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <Form.Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="type-select"
        >
          <option value="">All Types</option>
          {allTypes.map((t) => (
            <option key={t} value={t}>
              {cap(t)}
            </option>
          ))}
        </Form.Select>
      </Form>

      {listLoading && (
        <div className="status-row">
          <Spinner animation="border" size="sm" />
          <span>Loading Pokédex…</span>
        </div>
      )}

      {listError && <Alert variant="danger">{listError}</Alert>}

      <Row className="g-3">
        {displayedPokemons.map((p) => {
          const types = p.types.map((t) => t.type.name);
          const primaryType = types[0] ?? "normal";
          const borderColor = (typeColors[primaryType] ?? "#e6e6e6") + "55";

          return (
            <Col key={p.name} xs={6} sm={4} md={3} lg={2}>
              <button
                type="button"
                className="pokemon-card"
                onClick={() => openPokemon(p)}
                style={{ borderColor }}
              >
                <div
                  className="card-top"
                  style={{
                    background:
                      "linear-gradient(135deg, " +
                      (typeColors[primaryType] ?? "#eee") +
                      "33, #ffffff 70%)",
                  }}
                />

                <div className="img-wrap">
                  <img
                    src={p.sprites.other["official-artwork"].front_default}
                    alt={p.name}
                    className="pokemon-img"
                    loading="lazy"
                  />
                </div>

=                <div className="card-bottom">
                  <div className="pokemon-name">{cap(p.name)}</div>
                  {renderTypePills(types)}
                </div>
              </button>
            </Col>
          );
        })}
      </Row>

      {renderPager()}

      <Modal
        show={selectedPokemon !== null}
        onHide={() => setSelectedPokemon(null)}
        size="lg"
        centered
      >
        {selectedPokemon && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{cap(selectedPokemon.name)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="modal-hero">
                <img
                  src={
                    selectedPokemon.sprites.other["official-artwork"]
                      .front_default
                  }
                  alt={selectedPokemon.name}
                  className="modal-img"
                />
              </div>

              {detailsLoading && (
                <div className="status-row">
                  <Spinner animation="border" size="sm" />
                  <span>Loading details…</span>
                </div>
              )}
              {detailsError && <Alert variant="danger">{detailsError}</Alert>}

              <Tabs
                defaultActiveKey="types"
                id="pokemon-details-tabs"
                className="mb-2"
              >
                <Tab eventKey="types" title="Types">
                  {renderTypePills(
                    selectedPokemon.types.map((t) => t.type.name),
                  )}
                </Tab>

                <Tab eventKey="abilities" title="Abilities">
                  <ul className="clean-list scroll-list">
                    {abilities.map((a) => (
                      <li key={a.name}>{a.name}</li>
                    ))}
                  </ul>
                </Tab>

                <Tab eventKey="moves" title="Moves">
                  <ul className="clean-list scroll-list">
                    {moves.map((m) => (
                      <li key={m.name}>{m.name}</li>
                    ))}
                  </ul>
                </Tab>

                <Tab eventKey="stats" title="Stats">
                  <table className="table table-striped">
                    <tbody>
                      {selectedPokemon.stats.map((s) => (
                        <tr key={s.stat.name}>
                          <td>{cap(s.stat.name.replace("-", " "))}</td>
                          <td>{s.base_stat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Tab>
              </Tabs>
            </Modal.Body>
          </>
        )}
      </Modal>
    </Container>
  );
}
