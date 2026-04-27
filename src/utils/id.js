function padSequence(value) {
  return String(value).padStart(4, "0");
}

function getDateStamp(now = new Date()) {
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function createOrderId(sequence, now = new Date()) {
  return `ORD-${getDateStamp(now)}-${padSequence(sequence)}`;
}

module.exports = {
  createOrderId
};
