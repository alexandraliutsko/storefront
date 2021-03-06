import React from "react";

import "./pdp.css";

import Price from "../price/price";
import {CurrencyContext} from "../currency-context/currency-context";
import {ApolloClient, gql, InMemoryCache} from "@apollo/client";
import {withRouter} from "../../hocs/withRouter";
import Attribute from "../attribute/attribute";

class ProductDescriptionPage extends React.Component {
  _client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache()
  });

  attributes = [];

  state = {
    id: null,
    name: null,
    brand: null,
    amounts: [],
    symbols: [],
    gallery: [],
    description: null,
    mainPhotoSrc: null,
  }

  componentDidMount() {
    this.getData()
      .then(data => {
        const amounts = data.prices.map(price => price.amount);
        const symbols = data.prices.map(price => price.currency.symbol);
        this.attributes = data.attributes.map(attr => {
          const items = attr.items.map(item => [item.id, item.value])
          return {name: attr.name, type: attr.type, items: items}
        });

        this.setState({
          id: this.props.params.id,
          name: data.name,
          brand: data.brand,
          amounts: amounts,
          symbols: symbols,
          gallery: [...data.gallery],
          description: data.description
        });
      });
  }

  getData = async () => {
    return await this._client.query({
      query: gql`
        query GetProductById {
          product (id: "${this.props.params.id}") {
            name,
            brand,
            prices {
              currency {
                symbol,
                label
              },
              amount
            },
            gallery,
            description,
            attributes {
              id,
              name,
              type,
              items {
                displayValue,
                value,
                id
              }
            }
          }
        }`
    }).then(data => data.data.product);
  }

  setSrc = () => {
    return this.state.mainPhotoSrc ? this.state.mainPhotoSrc : this.state.gallery[0];
  }

  checkSrc = (e) => {
    e.persist();

    if (e.target.className === "description-img") {
      this.setState(state => {
        return {mainPhotoSrc: e.target.src};
      })
    }
  }

  renderAttributes = () => {
    return this.attributes.map(attr => {
      return <Attribute key={attr.name} name={attr.name} type={attr.type} values={attr.items} />
    })
  }

  renderImages = () => {
    return this.state.gallery.map(src => {
      return <img key={src} className="description-img" src={src} alt="description-pic"/>
    })
  }

  render() {
    return (
      <CurrencyContext.Consumer>
        {
          ({currency, switchCurrency}) => {
            let current;

            switch (currency) {
              case "USD":
                current = 0;
                break;
              case "GBP":
                current = 1;
                break;
              case "AUD":
                current = 2;
                break;
              case "JPY":
                current = 3;
                break;
              case "RUB":
                current = 4;
                break;
              default: current = 0;
            }

            return (
              <div className="description-page">
                <div className="photos" onClick={this.checkSrc}>
                  { this.renderImages() }
                </div>

                <div className="main-img">
                  <img src={this.setSrc()} alt="product"/>
                </div>

                <div className="description-box">
                  <div className="brand">{this.state.brand}</div>

                  <div className="name">{this.state.name}</div>

                  <div className="attributes">
                    { this.renderAttributes() }
                  </div>

                  <div className="price-box">
                    <span>Price:</span>
                    <Price symbol={this.state.symbols[current]} amount={this.state.amounts[current]} />
                  </div>

                  <button className="add-to-cart-btn">Add to cart</button>

                  <div className="description" dangerouslySetInnerHTML={{ __html: this.state.description}}/>
                </div>
              </div>
            )
          }
        }
      </CurrencyContext.Consumer>
    )
  }
}

export default withRouter(ProductDescriptionPage);
