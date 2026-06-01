export function convertToCSV(data, headers) {
  if (!data || data.length === 0) return "";

  const headerRow = headers.map(h => `"${h.label}"`).join(";");
  
  const rows = data.map(row => {
    return headers.map(h => {
      const value = h.key.includes('.') 
        ? h.key.split('.').reduce((obj, k) => obj?.[k], row) 
        : row[h.key];
      const formatted = value == null ? "" : String(value).replace(/"/g, '""');
      return `"${formatted}"`;
    }).join(";");
  });

  return [headerRow, ...rows].join("\n");
}

export function downloadCSV(csvContent, filename) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
