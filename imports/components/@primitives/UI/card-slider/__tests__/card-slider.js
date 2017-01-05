import { shallow } from "enzyme";
import { shallowToJson } from "enzyme-to-json";

import { CardSliderWithoutData as CardSlider } from "../card-slider";

describe("CardSlider", () => {
  const defaultProps = {
    items: [
      { count: "11,130", label: "Total Salvations" },
      { count: "3,982", label: "Student Salvations at Fuse and Gauntlet" },
    ],
  };

  const generateComponent = (additionalProps = {}) => {
    const newProps = {
      ...defaultProps,
      ...additionalProps,
    };
    return <CardSlider { ...newProps } />;
  };

  it("should render with default props", () => {
    const wrapper = shallow(generateComponent());
    expect(shallowToJson(wrapper)).toMatchSnapshot();
  });

});