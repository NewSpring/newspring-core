// stolen from https://github.com/kadirahq/flow-router/blob/ssr/server/ssr_data.js
/* eslint-disable no-underscore-dangle, prefer-rest-params */
export default function patchSubscribeData(ReactRouterSSR) {
  const originalSubscribe = Meteor.subscribe;

  Meteor.subscribe = function subscribe(pubName) {
    const params = Array.prototype.slice.call(arguments, 1);

    const ssrContext = ReactRouterSSR.ssrContext.get();
    if (ssrContext) {
      ReactRouterSSR.inSubscription.withValue(true, () => {
        ssrContext.addSubscription(pubName, params);
      });
    }

    if (originalSubscribe) {
      originalSubscribe.apply(this, arguments);
    }

    return {
      ready: () => true,
    };
  };

  const Mongo = Package.mongo.Mongo;
  const originalFind = Mongo.Collection.prototype.find;

  Mongo.Collection.prototype.find = function find(selector = {}, options = {}) {
    const ssrContext = ReactRouterSSR.ssrContext.get();
    if (ssrContext && !ReactRouterSSR.inSubscription.get()) {
      const collName = this._name;

      const newOptions = options;
      // this line is added just to make sure this works CollectionFS
      if (typeof this._transform === "function") {
        newOptions.transform = this._transform;
      }

      const collection = ssrContext.getCollection(collName);
      const cursor = collection.find(selector, newOptions);
      return cursor;
    }

    return originalFind.call(this, selector || {}, options);
  };

  // We must implement this. Otherwise, it'll call the origin prototype's
  // find method
  Mongo.Collection.prototype.findOne = function findOne(selector, options) {
    const newOptions = options || {};
    newOptions.limit = 1;
    return this.find(selector, newOptions).fetch()[0];
  };

  const originalAutorun = Tracker.autorun;

  Tracker.autorun = (fn) => {
    // if autorun is in the ssrContext, we need fake and run the callback
    // in the same eventloop
    if (ReactRouterSSR.ssrContext.get()) {
      const c = { firstRun: true, stop: () => {} };
      fn(c);
      return c;
    }

    return originalAutorun.call(Tracker, fn);
  };

  // By default, Meteor[call,apply] also inherit SsrContext
  // So, they can't access the full MongoDB dataset because of that
  // Then, we need to remove the SsrContext within Method calls
  ["call", "apply"].forEach((methodName) => {
    const original = Meteor[methodName];
    Meteor[methodName] = (...args) => {
      const response = ReactRouterSSR.ssrContext.withValue(null, () => (
        original.apply(this, args)
      ));

      return response;
    };
  });

  // This is not available in the server. But to make it work with SSR
  // We need to have it.
  Meteor.loggingIn = () => (false);
}