import { Component, PropTypes } from "react";
import { connect } from "react-apollo";
import gql from "graphql-tag";

import Authorized from "../../../blocks/authorzied";

import {
  modal as modalActions,
  give as giveActions,
} from "../../../store";

import Details from "./Details";
import Layout from "./Layout";
import Confirm from "./Details/Confirm";
import Recover from "./Recover";

const mapQueriesToProps = () => ({
  schedules: {
    query: gql`
      query GetScheduleTransactions {
        schedules: scheduledTransactions(cache: false) {
          numberOfPayments
          next
          end
          id
          reminderDate
          code
          gateway
          start
          date
          details {
            amount
            account {
              name
              description
            }
          }
          payment {
            paymentType
            accountNumber
            id
          }
          schedule {
            value
            description
          }
        }
      }
    `,
    forceFetch: true,
    ssr: false,
  },
  accounts: {
    query: gql`
      query GetFinancialAccounts {
        accounts {
          description
          name
          id: entityId
          summary
          image
          order
          images { fileName, fileType, fileLabel, s3, cloudfront }
        }
      }
    `,
    ssr: true,
  },
});

const mapStateToProps = store => ({
  give: store.give,
});

@connect({ mapStateToProps, mapQueriesToProps })
class Template extends Component {

  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    schedules: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired,
    give: PropTypes.object.isRequired,
  }

  confirm = (e) => {
    const { dataset } = e.currentTarget;
    const { id } = dataset;
    this.props.dispatch(giveActions.setRecoverableSchedule(Number(id)));

    return true;
  }

  cancel = (e) => {
    const { dataset } = e.currentTarget;
    const { id } = dataset;
    const { dispatch } = this.props;

    this.props.dispatch(modalActions.render(Confirm, {
      onFinished: () => {
        dispatch(giveActions.deleteSchedule(id));

        Meteor.call("give/schedule/cancel", { id }, () => {
          // console.log(err, response);
        });
      },
    }));
  }


  render() {
    const { schedules, accounts, give } = this.props;
    const { recoverableSchedules } = give;

    return (
      <Layout
        accountsReady={!accounts.loading}
        schedules={schedules.schedules}
        schedulesReady={!schedules.loading}
        accounts={accounts.accounts}
        cancelSchedule={this.cancel}
        recoverableSchedules={recoverableSchedules}
        confirm={this.confirm}
      />
    );
  }
}


const Routes = [
  { path: "schedules", component: Template },
  {
    path: "schedules/transfer",
    component: Authorized,
    indexRoute: { component: Recover },
  },
  {
    path: "schedules/:id",
    component: Authorized,
    indexRoute: { component: Details },
  },
];

export default {
  Template,
  Routes,
};
