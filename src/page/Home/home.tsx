// import React from 'react'
import Nav from "../../components/Nav/navBar";
import "./homeStyle.css";
import MainContent from "../../components/Main/mainContent";
function home() {
  return (
    <div>
      <header>
        <Nav />
      </header>
      <main>
        <MainContent />
      </main>
      <footer></footer>
    </div>
  );
}

export default home;
