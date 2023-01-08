const dateOptions = { weekday: "long", month: "long", day: "numeric" };
const dayOptions = { weekday: "long" };

const getDate = () => new Date().toLocaleDateString("en-US", dateOptions);
const getDay = () => new Date().toLocaleDateString("en-US", dayOptions);

// do this
// module.exports.getDate = getDate;
// module.exports.getDay = getDay;

// or do this
// module.exports = { getDate, getDay };

// or do this
exports.getDate = getDate;
exports.getDay = getDay;
