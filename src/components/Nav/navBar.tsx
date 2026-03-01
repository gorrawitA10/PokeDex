import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
// import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./navStyle.css";

function AppNavbar() {
  return (
    <Navbar expand="md" className="app-nav" sticky="top">
      <Container className="app-nav__inner">
        <Navbar.Brand className="app-nav__brand" href="/">
          <img
            src="/pokeball-pokemon.svg"
            alt="Pokeball"
            className="brand-logo"
          />
          <span className="brand-text">PokeDex</span>
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="app-offcanvas"
          className="app-nav__toggle"
        />

        <Navbar.Offcanvas
          id="app-offcanvas"
          aria-labelledby="app-offcanvas-label"
          placement="end"
          className="app-offcanvas"
        >
          <Offcanvas.Header closeButton className="app-offcanvas__header">
            <Offcanvas.Title
              id="app-offcanvas-label"
              className="app-offcanvas__title"
            >
              Menu
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body className="app-offcanvas__body">
            <Nav className="ms-auto app-nav__links">
              <Nav.Link className="app-link" href="/">
                Home
              </Nav.Link>

              {/* <Nav.Link className="app-link" href="/favorites">
                Favorites
              </Nav.Link> */}

              {/* <NavDropdown title="More" id="nav-more" className="app-dropdown">
                <NavDropdown.Item href="/about">About</NavDropdown.Item>
                <NavDropdown.Item href="/contact">Contact</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="/settings">Settings</NavDropdown.Item>
              </NavDropdown> */}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
