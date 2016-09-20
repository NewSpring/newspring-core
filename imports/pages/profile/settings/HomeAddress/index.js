import { Component, PropTypes } from "react";
import { connect } from "react-apollo";
import gql from "graphql-tag";

import {
  nav,
} from "../../../../store";

import { updateHome } from "../../../../methods/accounts/browser";
import { Error as Err, Loading } from "../../../../components/states";

import Success from "../Success";
import Layout from "./Layout";

// XXX remove cache: false once we feel good about caching
const mapQueriesToProps = () => ({
  data: {
    query: gql`
      query GetPersonsHome($cache: Boolean) {
        person: currentPerson {
          home(cache: $cache) {
            street1
            street2
            state
            city
            zip
            country
          }
        }
      }
    `,
    variables: { cache: true },
  },
});

const defaultHome = {
  street1: null,
  street2: null,
  state: null,
  city: null,
  zip: null,
  country: null,
};
@connect({ mapQueriesToProps })
export default class HomeAddress extends Component {

  static propTypes = {
    dispatch: PropTypes.function.isRequired,
    data: {
      refetch: PropTypes.function.isRequired,
      person: PropTypes.object.isRequired,
    },
  }

  state = {
    state: "default",
  }

  componentWillMount() {
    this.props.dispatch(nav.setLevel("BASIC_CONTENT"));
  }

  componentWillUnmount() {
    this.props.dispatch(nav.setLevel("TOP"));
  }

  updateAddress = (data) => {
    this.setState({ state: "loading" });
    updateHome(data, (err) => {
      if (err) {
        this.setState({ state: "error", err });
        setTimeout(() => {
          this.setState({ state: "default" });
        }, 3000);
        return;
      }

      this.setState({ state: "success" });
      this.props.data.refetch({ cache: false })
        .then(() => {
          this.setState({ state: "default" });
        });
    });
  }

  render() {
    const { person } = this.props.data;
    const { state } = this.state;
    const home = (person && person.home) || defaultHome;

    switch (state) {
      case "error":
        return <Err msg="Looks like there was a problem" />;
      case "loading":
        return <Loading msg="Updating your information..." />;
      case "success":
        return <Success msg="Your information has been updated!" />;
      default:
        return <Layout home={home} update={this.updateAddress} />;
    }
  }
}
