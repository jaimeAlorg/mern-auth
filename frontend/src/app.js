import React, { useState, useEffect } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Axios from "axios";
import Home from "./components/pages/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import NavBar from "./components/layout/NavBar";
import UserContext from "./components/context/UserContext";

import "./style.css";

export default function App() {
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined,
  });

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem("auth-token");
      console.log(token);

      if (token === null) {
        localStorage.setItem("auth-token", "");
        token = "";
      }
      const tokenRes = await Axios.post(
        "http://localhost:8080/users/isTokenValid",
        null,
        { headers: { "x-auth-token": token } }
      );

      if (tokenRes.data === true) {
        const userRes = await Axios.get("http://localhost:8080/users/", {
          headers: { "x-auth-token": token },
        });

        setUserData({
          token,
          user: userRes.data,
        });
      }
    };

    checkLoggedIn();
  }, []);

  return (
    <>
      <BrowserRouter>
        <UserContext.Provider value={{ userData, setUserData }}>
          <NavBar />
          <Switch>
            <Route exact path="/" component={Home}></Route>
            <Route path="/login" component={Login}></Route>
            <Route path="/register" component={Register}></Route>
          </Switch>
        </UserContext.Provider>
      </BrowserRouter>
    </>
  );
}
