/**
 * Export Utilities — CSV, JSON, and print-to-PDF
 * No external dependencies required.
 */

/** Convert array of objects to a CSV string */
export function toCSV(data: Record<string, any>[], filename: string): void {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const header = keys.join(',');
  const rows = data.map(row =>
    keys.map(k => {
      const val = row[k] ?? '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
    }).join(',')
  );
  const csv = [header, ...rows].join('\n');
  downloadText(csv, filename + '.csv', 'text/csv;charset=utf-8;');
}

/** Download a JSON export */
export function toJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  downloadText(json, filename + '.json', 'application/json');
}

/** Trigger browser print dialog for PDF export */
export function toPDF(title?: string): void {
  if (title) {
    document.title = title;
  }
  window.print();
}

/** Generic text file download helper */
function downloadText(content: string, filename: string, mime: string): void {
  const blob = new Blob(['\uFEFF' + content], { type: mime }); // BOM for Excel UTF-8
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Format orders for export */
export function formatOrdersForExport(orders: any[], currency: string = '₹') {
  return orders.map(o => ({
    'Order #': o.order_number,
    'Type': o.order_type?.replace('_', ' '),
    'Table': o.table_number || '',
    'Customer': o.customer_name || 'Walk-in',
    'Items': o.items?.length || 0,
    [`Subtotal (${currency})`]: o.subtotal,
    [`Tax (${currency})`]: o.tax_amount,
    [`Discount (${currency})`]: o.discount_amount,
    [`Grand Total (${currency})`]: o.grand_total,
    'Status': o.status,
    'Payment': o.payment_status,
    'Date': o.created_at ? new Date(o.created_at).toLocaleString() : '',
  }));
}

/** Format inventory for export */
export function formatInventoryForExport(items: any[], currency: string = '₹') {
  return items.map(i => ({
    'Code': i.code,
    'Name': i.name,
    'Category': i.category,
    'Unit': i.unit,
    'Current Stock': i.current_stock,
    'Min Stock': i.minimum_stock,
    'Max Stock': i.maximum_stock || '',
    [`Unit Cost (${currency})`]: i.unit_cost,
    [`Stock Value (${currency})`]: i.stock_value || (i.current_stock * i.unit_cost).toFixed(2),
    'Status': i.stock_status || '',
    'Location': i.storage_location || '',
    'Perishable': i.is_perishable ? 'Yes' : 'No',
  }));
}

/** Format live-ops summary for export */
export function formatLiveOpsForExport(liveOps: any, currency: string = '₹') {
  return [
    { 'Metric': 'Total Revenue', 'Value': `${currency}${liveOps.total_revenue}` },
    { 'Metric': 'Net Profit', 'Value': `${currency}${liveOps.net_profit}` },
    { 'Metric': 'Profit Margin', 'Value': `${liveOps.profit_margin_pct}%` },
    { 'Metric': 'Total Orders', 'Value': liveOps.total_orders },
    { 'Metric': 'Completed Orders', 'Value': liveOps.completed_orders },
    { 'Metric': 'Active Orders', 'Value': liveOps.active_orders },
    { 'Metric': 'Cancelled Orders', 'Value': liveOps.cancelled_orders },
    { 'Metric': 'Revenue Last Hour', 'Value': `${currency}${liveOps.recent_revenue_1h}` },
    { 'Metric': 'Avg Order Value', 'Value': `${currency}${liveOps.avg_order_value}` },
    { 'Metric': 'Total Customers', 'Value': liveOps.total_customers },
    { 'Metric': 'SLA Compliance', 'Value': `${liveOps.sla_ok}/${liveOps.sla_ok + liveOps.sla_breach} orders on time` },
    ...Object.entries(liveOps.payment_split || {}).map(([method, amount]) => ({
      'Metric': `Payment - ${method}`,
      'Value': `${currency}${amount}`,
    })),
  ];
}

export function getTodayLabel() {
  return new Date().toISOString().split('T')[0];
}
