
import InjectData from "../shared/inject-data";

Meteor.startup(() => {
  // var dom = $('script[type="text/inject-data"]', document);
  // var injectedDataString = $.trim(dom.text());
  const dom = document.querySelectorAll("script[type=\"text/inject-data\"]")[0];
  const injectedDataString = dom && dom.innerText ? dom.innerText.trim() : "";
  InjectData._data = InjectData._decode(injectedDataString) || {}; // eslint-disable-line
});

InjectData.getData = function getData(key, callback) {
  Meteor.startup(() => {
    callback(InjectData._data[key]); // eslint-disable-line
  });
};


export default InjectData;
