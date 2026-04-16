export function buildFilteredInsights(rows) {
  const schoolCount = {};
  const categoryCount = {};
  let participantsWithoutLomba = 0;

  rows.forEach((item) => {
    schoolCount[item.sekolah] = (schoolCount[item.sekolah] || 0) + 1;
    categoryCount[item.kategori] = (categoryCount[item.kategori] || 0) + 1;

    if (item.lombas.includes('Belum Memilih Lomba')) {
      participantsWithoutLomba += 1;
    }
  });

  const topSchool = Object.entries(schoolCount).sort((a, b) => b[1] - a[1])[0];
  const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
  const totalSelections = rows.reduce((sum, item) => sum + item.lombas.length, 0);
  const averageSelections = rows.length ? (totalSelections / rows.length).toFixed(1) : '0.0';

  return [
    {
      title: 'Fokus Filter Saat Ini',
      value: `${rows.length} peserta`,
      description: 'Jumlah peserta yang tampil mengikuti kombinasi filter aktif.',
    },
    {
      title: 'Kategori Dominan',
      value: topCategory?.[0] || 'Belum ada data',
      description: topCategory ? `${topCategory[1]} peserta pada kategori ini.` : 'Belum ada kategori yang tampil.',
    },
    {
      title: 'Sekolah Paling Aktif',
      value: topSchool?.[0] || 'Belum ada data',
      description: topSchool ? `${topSchool[1]} peserta berasal dari sekolah ini.` : 'Belum ada sekolah yang tampil.',
    },
    {
      title: 'Pilihan Lomba Rata-rata',
      value: `${averageSelections} lomba/peserta`,
      description:
        participantsWithoutLomba > 0
          ? `${participantsWithoutLomba} peserta belum memiliki pilihan lomba.`
          : 'Semua peserta pada hasil filter sudah memiliki pilihan lomba.',
    },
  ];
}
