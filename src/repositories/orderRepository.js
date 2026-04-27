const fs = require("fs");
const path = require("path");
const env = require("../config/env");

const inMemoryState = {
  orders: [],
  orderSequence: 1
};

function ensureDataFile() {
  const dirPath = path.dirname(env.dataFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  if (!fs.existsSync(env.dataFilePath)) {
    fs.writeFileSync(env.dataFilePath, JSON.stringify(inMemoryState, null, 2));
  }
}

function readFileState() {
  ensureDataFile();
  const content = fs.readFileSync(env.dataFilePath, "utf-8");
  return JSON.parse(content);
}

function writeFileState(state) {
  ensureDataFile();
  fs.writeFileSync(env.dataFilePath, JSON.stringify(state, null, 2));
}

function getState() {
  if (env.storageMode === "file") {
    return readFileState();
  }

  return inMemoryState;
}

function setState(state) {
  if (env.storageMode === "file") {
    writeFileState(state);
    return;
  }

  inMemoryState.orders = state.orders;
  inMemoryState.orderSequence = state.orderSequence;
}

function addOrder(order) {
  const state = getState();
  state.orders.push(order);
  state.orderSequence += 1;
  setState(state);
}

function findOrderById(orderId) {
  const state = getState();
  return state.orders.find((order) => order.orderId === orderId) || null;
}

function updateOrder(orderId, updates) {
  const state = getState();
  const index = state.orders.findIndex((order) => order.orderId === orderId);

  if (index < 0) {
    return null;
  }

  state.orders[index] = {
    ...state.orders[index],
    ...updates
  };

  setState(state);
  return state.orders[index];
}

function getAllOrders() {
  const state = getState();
  return state.orders;
}

function getOrderSequence() {
  const state = getState();
  return state.orderSequence;
}

module.exports = {
  addOrder,
  findOrderById,
  updateOrder,
  getAllOrders,
  getOrderSequence
};
