import truncate from "truncate";
import { withRouter } from "react-router";

import SideBySide from "../../../components/cards/SideBySide";

import Tag from "../components/Tag";

export default withRouter(({ group, router, onHover }) => {
  const theGroup = group || {};

  return (
    <button
      onMouseOver={onHover}
      id={theGroup.id}
      onClick={() => router.push(`/groups/${theGroup.id}`)}
      className="relative one-whole push-bottom@lap-and-up plain"
    >
      <SideBySide
        defaultImage={
          theGroup.photo ?
            theGroup.photo :
            "//s3.amazonaws.com/ns.assets/apollos/group-profile-placeholder.png"
        }
        left={["one-whole", "two-thirds@lap-and-up"]}
        right={["one-whole", "one-third@lap-and-up"]}
      >
        {/* Name */}
        <h4 className="plain text-dark-primary push-half-top push-top@anchored">
          {theGroup.name}
        </h4>

        {/* Schedule */}
        {(() => {
          if (!theGroup.schedule || !theGroup.schedule.description) return null;
          return (
            <h6 className="plain text-dark-tertiary">
              {theGroup.schedule.description}
            </h6>
          );
        })()}

        {/* Distance */}
        {(() => {
          if (!theGroup.distance) return null;
          return (
            <h6 className="em text-dark-tertiary push-half-bottom">
              {theGroup.distance.toFixed(2)} miles away
            </h6>
          );
        })()}


        {/* Description */}
        <p className="plain text-dark-primary">{truncate(theGroup.description, 120)}</p>

        {/* Tags */}
        <div className="soft-half-top">
          {theGroup.tags && theGroup.tags.filter(x => x).map((tag, i) => (
            <Tag val={tag.value} key={i} />
          ))}
          {(() => {
            if (!theGroup.type || theGroup.type === "Interests") return null;
            return <Tag val={theGroup.type} />;
          })()}
          {(() => {
            if (!theGroup.kidFriendly) return null;
            return <Tag val="kid friendly" />;
          })()}
          {(() => {
            if (!theGroup.demographic) return null;
            return <Tag val={group.demographic} />;
          })()}
        </div>

      </SideBySide>
    </button>
  );
});
