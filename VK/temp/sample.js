// Input 1: from Price_Edit (price list)
const priceItems = $input.all(0);   // first input
// Input 2: from Order_Edit (orders)
const orderItems = $input.all(1);   // second input

// 1) Build price map from Edit Fields output
const priceMap = {};
for (const it of priceItems) {
  const row = it.json;            // this is what Edit Fields produced
  if (!row.Item) continue;
  const price = Number(row.Price || 0);
  priceMap[row.Item] = price;
}

// 2) Group orders by customer and calculate totals
const invoicesByCustomer = {};

function getInvoice(customer) {
  if (!invoicesByCustomer[customer]) {
    invoicesByCustomer[customer] = {
      Customer: customer,
      Lines: [],
      TotalAmount: 0,
    };
  }
  return invoicesByCustomer[customer];
}

for (const it of orderItems) {
  const row = it.json;            // Edit Fields output for orders
  const customer = row.Customer;
  const item = row.Item;
  const qty = Number(row.Quantity || 0);

  if (!customer || !item || !qty) continue;

  const price = priceMap[item] || 0;
  const lineTotal = price * qty;

  const invoice = getInvoice(customer);

  invoice.Lines.push({
    Item: item,
    Quantity: qty,
    UnitPrice: price,
    LineTotal: lineTotal,
  });

  invoice.TotalAmount += lineTotal;
}

// 3) Return one item per customer invoice
return Object.values(invoicesByCustomer).map(inv => ({ json: inv }));
