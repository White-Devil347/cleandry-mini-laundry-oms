const { GARMENT_PRICING, ORDER_STATUSES } = require("../config/pricing");

function isValidPhoneNumber(phoneNumber) {
  return /^\d{10}$/.test(String(phoneNumber || ""));
}

function validateCreateOrderPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    errors.push("Request body is required.");
    return errors;
  }

  if (!payload.customerName || typeof payload.customerName !== "string") {
    errors.push("customerName is required and must be a string.");
  }

  if (!isValidPhoneNumber(payload.phoneNumber)) {
    errors.push("phoneNumber must be a valid 10-digit number.");
  }

  if (!Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push("items is required and must be a non-empty array.");
    return errors;
  }

  payload.items.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      errors.push(`items[${index}] must be an object.`);
      return;
    }

    if (!item.garmentType || typeof item.garmentType !== "string") {
      errors.push(`items[${index}].garmentType is required and must be a string.`);
    } else if (!Object.prototype.hasOwnProperty.call(GARMENT_PRICING, item.garmentType)) {
      errors.push(`items[${index}].garmentType must be one of: ${Object.keys(GARMENT_PRICING).join(", ")}.`);
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      errors.push(`items[${index}].quantity must be a positive integer.`);
    }
  });

  return errors;
}

function validateStatusPayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== "object") {
    errors.push("Request body is required.");
    return errors;
  }

  if (!payload.status || typeof payload.status !== "string") {
    errors.push("status is required and must be a string.");
  } else if (!ORDER_STATUSES.includes(payload.status)) {
    errors.push(`status must be one of: ${ORDER_STATUSES.join(", ")}.`);
  }

  return errors;
}

module.exports = {
  validateCreateOrderPayload,
  validateStatusPayload
};
