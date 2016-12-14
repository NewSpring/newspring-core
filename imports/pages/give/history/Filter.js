
import { Component, PropTypes } from "react";
import moment from "moment";

// import Date from "../../../blocks/add-to-cart/Schedule/Date";

import TagSelect from "../../../components/forms/TagSelect";
import Tag from "../../../components/tags";
import Date from "../../../blocks/add-to-cart/Schedule/Date";

const DATE_RANGES = [
  { label: "Last Month", value: "LastMonth" },
  { label: "Last 6 Months", value: "LastSixMonths" },
  { label: "Last Year", value: "LastYear" },
  { label: "All Time", value: "AllTime" },
];

export default class Filter extends Component {

  static propTypes = {
    family: PropTypes.array.isRequired,
    changeFamily: PropTypes.func.isRequired,
    changeDates: PropTypes.func.isRequired,
    findByLimit: PropTypes.func.isRequired,
  }

  state = {
    people: [],
    start: "",
    end: "",
    expanded: false,
    showStartDatePicker: false,
    showEndDatePicker: false,
    customStartLabel: "Start Date",
    customEndLabel: "End Date",
    customStartActive: false,
    customEndActive: false,
    limit: 20,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.family.length !== nextProps.family.length) {
      this.setState({ people: nextProps.family.map((x) => x.person.id) });
    }
  }

  onClick = ({ id }) => {
    const people = [...this.state.people];
    const index = people.indexOf(id);
    if (index > -1) {
      people.splice(index, 1);
      this.setState({ people });
      return;
    }

    people.push(id);
    this.setState({ people });
  }

  toggle = () => {
    this.setState({ expanded: !this.state.expanded });
  }

  dateRangeClick = (value: string) => {
    this.setState(({ start, end, limit }) => {
      let transactionLimit;
      if (start !== "" || end !== "") {
        if (value === "AllTime" && limit === 20) {
          transactionLimit = 20;
        }
        return { start: "", end: "", limit: transactionLimit };
      }

      let startDate;
      let endDate;
      if (value === "LastMonth") {
        startDate = moment().subtract(30, "days");
        endDate = moment();
      } else if (value === "LastSixMonths") {
        startDate = moment().subtract(6, "months");
        endDate = moment();
      } else if (value === "LastYear") {
        startDate = moment().subtract(12, "months");
        endDate = moment();
      } else {
        transactionLimit = 0;
      }

      return {
        start: startDate,
        end: endDate,
        limit: transactionLimit,
      };
    });
  }

  fixPickerPosition = () => {
    const picker = document.getElementById("datepicker");
    if (!picker) return;

    const child = picker.children[0];
    const globalTop = Number(child.getBoundingClientRect().top);
    if (globalTop < 0) {
      const marginTop = Number(child.style.marginTop.slice(0, -2));
      child.style.marginTop = `${marginTop + Math.abs(globalTop)}px`;
    }
  }

  toggleStartDatePicker = () => {
    this.setState(({ showStartDatePicker }) => ({ showStartDatePicker: !showStartDatePicker }));
    setTimeout(() => {
      this.fixPickerPosition();
    }, 200);
  }

  toggleEndDatePicker = () => {
    this.setState(({ showEndDatePicker }) => ({ showEndDatePicker: !showEndDatePicker }));
    setTimeout(() => {
      this.fixPickerPosition();
    }, 200);
  }

  startClick = (value: string) => {
    if (value === "StartDate") {
      if (this.state.start !== "") {
        this.setState({ start: "" });
        this.setState({ customStartLabel: "Start Date" });
        this.setState({ customStartActive: false });
      } else {
        this.setState(({ showStartDatePicker }) => ({ showStartDatePicker: !showStartDatePicker }));
      }
    }

    if (value === "EndDate") {
      if (this.state.end !== "") {
        this.setState({ end: "" });
        this.setState({ customEndLabel: "End Date" });
        this.setState({ customEndActive: false });
      } else {
        this.setState(({ showEndDatePicker }) => ({ showEndDatePicker: !showEndDatePicker }));
      }
    }
  }

  onStartDayClick = (e, day, { selected, disabled }) => {
    if (disabled) return;
    this.setState({ start: selected ? null : day });
    this.setState({ customStartLabel: selected ? "Start Date" : moment(day).format("ll") });
    this.setState({ customStartActive: !selected });
  }

  onEndDayClick = (e, day, { selected, disabled }) => {
    if (disabled) return;
    this.setState({ end: selected ? null : day });
    this.setState({ customEndLabel: selected ? "End Date" : moment(day).format("ll") });
    this.setState({ customEndActive: !selected });
  }

  filterResults = () => {
    this.props.changeFamily(this.state.people);
    this.props.changeDates(this.state.start === "" ? "" : moment(this.state.start).format("L"), this.state.end === "" ? "" : moment(this.state.end).format("L"));
    this.props.findByLimit(this.state.limit);
  }

  render() {
    const { family } = this.props;
    const { expanded } = this.state;
    return (
      <div>
        <div
          onClick={this.toggle}
          className={
            "one-whole background--light-primary " +
            "soft-half-ends soft-sides soft-double-sides@lap-and-up"
          }
        >
          <h7 className="text-dark-secondary flush-bottom push-half-left display-inline-block">
            Filter Transactions
          </h7>
          <span
            className={`float-right flush ${expanded ? "icon-close" : "icon-filter"}`}
            style={{ marginTop: expanded ? "0px" : "0px", cursor: "pointer" }}
          />
        </div>
        <div className="one-whole outlined--bottom outlined--light" />
        {expanded && (
          <div
            className={
              "one-whole outlined--light outlined--bottom background--light-primary " +
              "soft-half-ends soft-sides soft-double-sides@lap-and-up push-half-left"
            }
          >
            {family && family.length && family.length > 1 && (
              <div>
                <h7 className="push-top text-dark-secondary display-inline-block">
                  Family Members
                </h7>

                {family.map(({ person }, key) => {
                  const active = this.state.people.indexOf(person.id) > -1;
                  return (
                    <div
                      key={key}
                      style={{ cursor: "pointer" }}
                      className=""
                      onClick={() => this.onClick(person)}
                    >
                      <div
                        className={
                          `${active ? "checkbox-checked" : ""} ` +
                          "display-inline-block outlined checkbox"
                        }
                      />
                      <h6 className="soft-half-left display-inline-block">
                        {person.nickName || person.firstName} {person.lastName}
                      </h6>
                    </div>
                  );
                })}
              </div>
            )}

            <h7 className="soft-half-top push-half-top text-dark-secondary display-inline-block">
              Date Range
            </h7>
            <div className="grid one-whole flush-left@palm">
              <div
                className={
                  "hard-left@palm grid__item one-whole"
                }
              >
                <TagSelect items={DATE_RANGES} onClick={this.dateRangeClick} />
              </div>
            </div>

            <h7 className="soft-half-top push-half-top text-dark-secondary display-inline-block">
              Custom Dates
            </h7>
            <div className="grid one-whole flush-left@palm">
              <div
                className={
                  "hard-left@palm grid__item one-whole display-inline-block"
                }
              >
                <Tag
                  key={1}
                  label={this.state.customStartLabel}
                  val={"StartDate"}
                  onClick={this.startClick}
                  active={this.state.customStartActive}
                  className={false && "tag--disabled"}
                />
                <Tag
                  key={2}
                  label={this.state.customEndLabel}
                  val={"EndDate"}
                  onClick={this.startClick}
                  active={this.state.customEndActive}
                  className={false && "tag--disabled"}
                />
              </div>
            </div>
            <div className="push-top display-block">
              <button
                className={"btn one-whole@handheld"}
                onClick={this.filterResults}
              >
                {"Filter Results"}
              </button>
            </div>
            {/* eslint-disable */}
            {this.state.showStartDatePicker && (
              <Date
                start={this.state.start}
                onDayClick={this.onStartDayClick}
                toggleDatePicker={this.toggleStartDatePicker}
                allTime={true}
              />
            )}
            {this.state.showEndDatePicker && (
              <Date
                start={this.state.end}
                onDayClick={this.onEndDayClick}
                toggleDatePicker={this.toggleEndDatePicker}
                allTime={true}
              />
            )}
            {/* eslint-enable */}
          </div>
        )}
      </div>
    );
  }
}
