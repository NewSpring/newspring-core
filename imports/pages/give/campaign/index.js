import { Component, PropTypes } from "react";
import { connect } from "react-apollo";
import gql from "graphql-tag";

import Loading from "../../../components/loading";

import {
  nav as navActions,
} from "../../../store";

import Layout from "./Layout";

const mapQueriesToProps = () => ({
  accounts: {
    query: gql`
      query GetFinancialAccounts {
        accounts {
          description
          name
          id
          summary
          image
          order
          images {
            fileName
            fileType
            fileLabel
            s3
            cloudfront
          }
        }
      }
    `,
  },
});

@connect({ mapQueriesToProps })
class Template extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    accounts: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
  }

  componentWillMount() {
    this.props.dispatch(navActions.setLevel("BASIC_CONTENT"));
  }

  componentWillUnmount() {
    this.props.dispatch(navActions.setLevel("TOP"));
  }

  getAccount() {
    const { accounts, params } = this.props;
    if (!accounts.accounts || !params.name) return false;
    for (const account of accounts.accounts) {
      if (account.name === decodeURI(params.name)) return account;
    }

    return false;
  }

  render() {
    const { accounts } = this.props;
    if (accounts.loading) return <Loading />;

    const account = this.getAccount();
    if (!account) return <Loading />;

    return <Layout account={account} />;
  }
}


const Routes = [
  { path: "campaign/:name", component: Template },
];

export default {
  Template,
  Routes,
};
