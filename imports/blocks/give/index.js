import { Component, PropTypes } from "react";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import gql from "graphql-tag";

import OnBoard from "../../blocks/accounts";
import { modal, give as giveActions } from "../../store";

import Layout from "./Layout";

const defaultArray = []; // empty array for usage as default in render

const CHECKOUT_QUERY = gql`
  query GetCheckoutData($state: Int!, $country: Int!) {
    states: definedValues(id: $state, all: true) {
      name: description, value, id, _id
    }
    countries: definedValues(id: $country, all: true) {
      name: description, value, id, _id
    }
    person: currentPerson {
      firstName
      nickName
      lastName
      email
      campus { name, id: entityId }
      home { street1, street2, city, state, zip, country }
    }
    savedPayments {
      name, id: entityId, date,
      payment { accountNumber, paymentType }
    }
    campuses { name, id: entityId }
  }
`;

const withCheckout = graphql(CHECKOUT_QUERY, {
  options: { variables: { state: 28, country: 45 } },
});

// We only care about the give state
const mapStateToProps = (state) => ({
  give: state.give,
});

@connect(mapStateToProps)
@withCheckout
export default class Give extends Component {

  static propTypes = {
    give: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
  }

  componentWillMount() {
    this.updateData(this.props);

    const { savedAccount } = this.props.give;
    if (!savedAccount.id) return;

    this.props.dispatch(giveActions.setProgress(4));
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.data.loading && this.props.data.loading) {
      this.updateData(nextProps);
    }
  }

  componentWillUnmount() {
    if (this.props.give.state !== "default") {
      this.props.dispatch(giveActions.clearData());
      this.props.dispatch(giveActions.clearSchedules());
    }
  }

  onSubmit = (e) => {
    e.preventDefault();
    const { dispatch } = this.props;
    dispatch(giveActions.submit());
  }

  updateData = ({ data }) => {
    if (data.loading || !data.person) return;

    const { person } = data;

    let { campus, home } = person;

    if (!campus) {
      campus = {};
    }

    if (!home) {
      home = {};
    }

    const mappedPerson = {
      personal: {
        firstName: person.nickName || person.firstName,
        lastName: person.lastName,
        email: person.email,
        campus: campus.name,
        campusId: campus.id,
      },
      billing: {
        streetAddress: home.street1,
        streetAddress2: home.street2,
        city: home.city,
        state: home.state,
        zip: home.zip,
        country: home.country,
      },
    };

    this.props.dispatch(giveActions.save(mappedPerson));
  }

  next = (e) => {
    e.preventDefault();
    this.props.dispatch(giveActions.next());
  }

  goToStepOne = (e) => {
    e.preventDefault();
    this.props.dispatch(giveActions.clearAccount());
    this.props.dispatch(giveActions.setState("default"));
    this.props.dispatch(giveActions.setProgress(1));
  }

  changeSavedAccount = (account) => {
    this.props.dispatch(giveActions.setAccount(account));
  }

  back = (e) => {
    e.preventDefault();
    if (this.props.give.step === 1) {
      this.props.dispatch(modal.hide());
      return;
    }

    this.props.dispatch(giveActions.previous());
  }

  goToAccounts = () => {
    const { data } = this.props.give;

    const props = {
      coverHeader: true,
      account: false,
      data: {
        email: data.personal.email,
        firstName: data.personal.firstName,
        lastName: data.personal.lastName,
        terms: true,
      },
    };
    this.props.dispatch(modal.render(OnBoard, props));
  }

  save = (...args) => {
    this.props.dispatch(giveActions.save(...args));
  }

  clear = (...args) => {
    this.props.dispatch(giveActions.clear(...args));
  }

  clearData = () => {
    this.props.dispatch(giveActions.clearData());
    this.props.dispatch(modal.hide());
  }

  render() {
    let {
      campuses = defaultArray,
      countries = defaultArray,
      states = defaultArray,
    } = this.props.data;

    const { savedPayments = defaultArray } = this.props.data;

    campuses = campuses.map((x) => ({ label: x.name, value: x.id }));
    countries = countries.map((x) => ({ label: x.name, value: x.value }));
    states = states.map((x) => ({ label: x.name, value: x.value }));

    return (
      <Layout
        back={this.back}
        changeSavedAccount={this.changeSavedAccount}
        clear={this.clear}
        clearData={this.clearData}
        goToAccounts={this.goToAccounts}
        goToStepOne={this.goToStepOne}
        next={this.next}
        onSubmit={this.onSubmit}
        save={this.save}

        campuses={campuses}
        countries={countries}
        data={this.props.data}
        give={this.props.give}
        savedPayments={savedPayments}
        states={states}
      />
    );
  }
}
