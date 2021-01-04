import React from "react";
import { Link } from "react-router-dom";
import AuthOptions from "./AuthOptions";

export default function NavBar() {
  return (
    <header id="header">
      <Link to="/">
        <h1 className="title">MERN Auth</h1>
      </Link>
      <AuthOptions />
    </header>
  );
}
