
const statuses = [
  "Pending",
  "In Progress",
  "Completed",
  "On Hold",
];

function validIntId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validUuid(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function validateTextFields(body, fields) {
  for (const field of fields) {
    if (
      typeof body[field] !== "string" ||
      body[field].trim().length === 0
    ) {
      return `${field} is required and must be a non-empty string`;
    }
  }

  return null;
}

module.exports = {
  statuses,
  validIntId,
  validUuid,
  validateTextFields,
};
