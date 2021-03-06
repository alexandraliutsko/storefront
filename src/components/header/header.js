import React from "react";
import { NavLink } from "react-router-dom";

import "./header.css";
import {ApolloClient, gql, InMemoryCache} from "@apollo/client";
import CurrencySwitcher from "../currency-switcher/currency-switcher";

export default class Header extends React.Component {
  _client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache()
  })

  state = {
    categories: [],
    showSwitcher: false
  }

  componentDidMount() {
    this.getCategories()
      .then(data => {
        this.setState({
          categories: data
        });
      });
  }

  getCategories = async () => {
    return await this._client.query({
      query: gql`
        query GetCategories {
          categories {
            name
          }
        }`
    }).then((data) => {
        return [data.data.categories[0].name, data.data.categories[1].name, data.data.categories[2].name]
    });
  }

  showSwitcher = () => {
    if (this.state.showSwitcher) {
      this.setState({showSwitcher: false});
    } else if (!this.state.showSwitcher) {
      this.setState({showSwitcher: true});
    }
  }

  render() {
    return (
      <div className="app_header">
        <nav className="nav">
          <ul className="nav_list">
            <li className="nav_item">
              <NavLink to="/">{this.state.categories[0]}</NavLink>
            </li>
            <li className="nav_item">
              <NavLink to="/clothes/">{this.state.categories[1]}</NavLink>
            </li>
            <li className="nav_item">
              <NavLink to="/tech/">{this.state.categories[2]}</NavLink>
            </li>
          </ul>
        </nav>

        <div className="logo">
          <NavLink to="/">
            <img src="/img/logo.svg" alt="logo"/>
          </NavLink>
        </div>

        <div className="actions">
          <div className="currency-icon" onClick={this.showSwitcher}>
            <img src="/img/currency.svg" alt="currency"/>
            <img className="row" src="/img/row.svg" alt="row"/>
          </div>

          <div className="cart-icon">
            <img src="/img/empty-cart.svg" alt="cart"/>
          </div>

          {this.state.showSwitcher ? <CurrencySwitcher /> : null}
        </div>
      </div>
    );
  }
}
