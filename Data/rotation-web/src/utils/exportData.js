const escapeCsv = (value) => {
  const text = value == null ? '' : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
};

export const exportParticipantsCsv = (rows, fileName = 'rotation-participants.csv') => {
  const headers = ['No', 'Waktu', 'Nama Peserta', 'Asal Sekolah', 'Kategori', 'Lomba Diikuti', 'No WA'];
  const lines = rows.map((item, index) =>
    [
      index + 1,
      item.waktu,
      item.nama,
      item.sekolah,
      item.kategori,
      item.lombas.join(', '),
      item.noWa,
    ]
      .map(escapeCsv)
      .join(',')
  );

  const csvContent = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
