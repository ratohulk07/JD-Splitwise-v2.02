let people = [];
let trips = {};
let currentTrip = "";

function save() {
  localStorage.setItem("splitwise_data", JSON.stringify({ people, trips }));
}

function load() {
  let data = JSON.parse(localStorage.getItem("splitwise_data"));
  if (data) {
    people = data.people || [];
    trips = data.trips || {};
  }
}
load();

/* ---------------- PEOPLE ---------------- */
function addPerson() {
  let name = document.getElementById("personInput").value;
  if (!name || people.includes(name)) return;

  people.push(name);
  document.getElementById("personInput").value = "";
  save();
  renderPeople();
}

/* ---------------- TRIPS ---------------- */
function createTrip() {
  let name = document.getElementById("tripInput").value;
  if (!name || trips[name]) return;

  trips[name] = { expenses: [] };

  save();
  loadTrips();
}

/* ---------------- SWITCH TRIP ---------------- */
function switchTrip() {
  currentTrip = document.getElementById("tripSelect").value;
  document.getElementById("app").style.display = "block";
  render();
}

/* ---------------- ADD EXPENSE ---------------- */
function addExpense() {
  let desc = document.getElementById("desc").value;
  let amount = parseFloat(document.getElementById("amount").value);
  let payer = document.getElementById("payer").value;

  let participants = Array.from(
    document.querySelectorAll("#participants input:checked")
  ).map(x => x.value);

  if (!desc || !amount || !payer) return;

  trips[currentTrip].expenses.push({
    desc,
    amount,
    payer,
    participants
  });

  save();
  render();
}

/* ---------------- RENDER PEOPLE ---------------- */
function renderPeople() {
  document.getElementById("peopleList").innerText = people.join(", ");
}

/* ---------------- LOAD TRIPS ---------------- */
function loadTrips() {
  let html = "<option value=''>Select Trip</option>";

  Object.keys(trips).forEach(t => {
    html += `<option>${t}</option>`;
  });

  document.getElementById("tripSelect").innerHTML = html;
}

/* ---------------- RENDER APP ---------------- */
function render() {
  renderPeople();

  document.getElementById("participants").innerHTML =
    people.map(p =>
      `<label><input type="checkbox" value="${p}" checked> ${p}</label>`
    ).join("");

  document.getElementById("payer").innerHTML =
    people.map(p => `<option>${p}</option>`).join("");

  let expenses = trips[currentTrip]?.expenses || [];

  document.getElementById("expenseList").innerHTML =
    expenses.map(e =>
      `<li>${e.desc} - ₹${e.amount} (${e.payer})</li>`
    ).join("");

  let balances = {};
  people.forEach(p => balances[p] = 0);

  expenses.forEach(e => {
    let share = e.amount / e.participants.length;

    balances[e.payer] += e.amount;

    e.participants.forEach(p => {
      balances[p] -= share;
    });
  });

  document.getElementById("balanceList").innerHTML =
    Object.entries(balances)
      .map(([p,b]) => `<li>${p}: ${b.toFixed(2)}</li>`)
      .join("");

  let creditors = [], debtors = [];

  for (let p in balances) {
    if (balances[p] > 0) creditors.push({ name: p, amt: balances[p] });
    if (balances[p] < 0) debtors.push({ name: p, amt: -balances[p] });
  }

  let result = [];

  while (creditors.length && debtors.length) {
    let c = creditors[0];
    let d = debtors[0];

    let pay = Math.min(c.amt, d.amt);

    result.push(`${d.name} pays ${c.name} ₹${pay.toFixed(2)}`);

    c.amt -= pay;
    d.amt -= pay;

    if (c.amt === 0) creditors.shift();
    if (d.amt === 0) debtors.shift();
  }

  document.getElementById("settlementList").innerHTML =
    result.map(r => `<li>${r}</li>`).join("");
}

/* INIT */
loadTrips();
loadTrips();