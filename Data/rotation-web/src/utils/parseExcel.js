const SCHOOL_ALIASES = {
  'mts muhammadiyah balebo': 'MTs Muhammadiyah Balebo',
  'ma muhammadiyah balebo': 'MA Muhammadiyah Balebo',
  'ma nurul junaidiyah': 'MA Nurul Junaidiyah',
  'ma nurul junaidiyah lauwo': 'MA Nurul Junaidiyah Lauwo',
  'pesantren darul arqam muhammadiyah balebo': 'Pondok Pesantren Darul Arqam Muhammadiyah Balebo',
  'pondok pesantren darul arqam muhammadiyah balebo': 'Pondok Pesantren Darul Arqam Muhammadiyah Balebo',
  'darul arqam muhammadiyah balebo': 'Pondok Pesantren Darul Arqam Muhammadiyah Balebo',
  'ponpes nurul junaidiyah': 'Ponpes Nurul Junaidiyah',
  'ponpes nurul junaidiyah lauwo luwu timur': 'Ponpes Nurul Junaidiyah Lauwo Luwu Timur',
  'smp muhammadiyah balebo': 'SMP Muhammadiyah Balebo',
};

const LOMBA_ALIASES = {
  'e-sport mobile legend': 'E-Sport Mobile Legend',
  'e-sport: mobile legend': 'E-Sport Mobile Legend',
  'esport mobile legend': 'E-Sport Mobile Legend',
};

const HEADER_FALLBACKS = {
  timestamp: 0,
  nama: 1,
  sekolah: 2,
  kategori: 3,
  wa: 4,
};

const REQUIRED_COLUMN_KEYS = ['timestamp', 'nama', 'sekolah', 'kategori'];

const cleanText = (value) => value?.toString().trim().replace(/\s+/g, ' ') || '';

const toKey = (value) => cleanText(value).toLowerCase();

const titleCaseWords = (value) =>
  cleanText(value)
    .split(' ')
    .map((word) => {
      if (word.length <= 3 && word === word.toUpperCase()) {
        return word;
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

const normalizeSchool = (value) => {
  const cleaned = cleanText(value);
  if (!cleaned) return 'Tidak Diketahui';

  const alias = SCHOOL_ALIASES[toKey(cleaned)];
  return alias || titleCaseWords(cleaned);
};

const normalizeLomba = (value) => {
  const cleaned = cleanText(value);
  if (!cleaned || toKey(cleaned) === 'none') return null;

  return LOMBA_ALIASES[toKey(cleaned)] || cleaned;
};

const formatTimestamp = (value, xlsx) => {
  if (!value) return '-';

  try {
    if (typeof value === 'number') {
      const parsed = xlsx.SSF.parse_date_code(value);
      if (!parsed) return '-';

      const date = new Date(
        Date.UTC(parsed.y, parsed.m - 1, parsed.d, parsed.H || 0, parsed.M || 0, parsed.S || 0)
      );

      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return cleanText(value) || '-';

    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return cleanText(value) || '-';
  }
};

const countBy = (items, accessor) =>
  items.reduce((accumulator, item) => {
    const key = accessor(item);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

const toChartData = (record, limit = Infinity) =>
  Object.entries(record)
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name))
    .slice(0, limit);

const findColumnIndex = (headers, matcher, fallback) => {
  const index = headers.findIndex((header) => matcher(toKey(header)));
  return index >= 0 ? index : fallback;
};

const getColumnIndexes = (headers) => {
  const lombaColumns = headers
    .map((header, index) => ({ header: toKey(header), index }))
    .filter(
      ({ header }) =>
        header.startsWith('pilih lomba') ||
        header.startsWith('pilih  lomba') ||
        header === 'pilih lomba 2'
    )
    .map(({ index }) => index);

  return {
    timestamp: findColumnIndex(headers, (header) => header === 'timestamp', HEADER_FALLBACKS.timestamp),
    nama: findColumnIndex(headers, (header) => header.includes('nama peserta'), HEADER_FALLBACKS.nama),
    sekolah: findColumnIndex(headers, (header) => header.includes('asal sekolah'), HEADER_FALLBACKS.sekolah),
    kategori: findColumnIndex(headers, (header) => header.includes('kategori lomba'), HEADER_FALLBACKS.kategori),
    wa: findColumnIndex(headers, (header) => header.includes('no wa'), HEADER_FALLBACKS.wa),
    lomba: lombaColumns.length ? lombaColumns : [5, 8, 11],
  };
};

const buildWarnings = (headers, columns, rows) => {
  const warnings = [];
  const normalizedHeaders = headers.map(toKey);

  const missingRequired = REQUIRED_COLUMN_KEYS.filter((key) => {
    const fallbackIndex = HEADER_FALLBACKS[key];
    return !normalizedHeaders[fallbackIndex] && columns[key] === fallbackIndex;
  });

  if (missingRequired.length > 0) {
    warnings.push(
      `Beberapa kolom wajib tidak ditemukan dengan jelas: ${missingRequired.join(', ')}. Data masih dicoba dibaca memakai posisi kolom default.`
    );
  }

  if (columns.lomba.length === 0) {
    warnings.push('Kolom pilihan lomba tidak ditemukan. Peserta tanpa lomba akan diberi label "Belum Memilih Lomba".');
  }

  if (rows.length === 0) {
    warnings.push('Sheet pertama tidak memiliki baris data yang bisa dibaca.');
  }

  return warnings;
};

const parseWorkbook = async (source, readType) => {
  const xlsx = await import('xlsx');
  const workbook = xlsx.read(source, { type: readType });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  if (!worksheet) {
    throw new Error('Sheet pertama tidak ditemukan di file Excel.');
  }

  const rawRows = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const headers = (rawRows[0] || []).map(cleanText);
  const rows = rawRows.slice(1).filter((row) => row.some((cell) => cleanText(cell) !== ''));
  const columns = getColumnIndexes(headers);
  const warnings = buildWarnings(headers, columns, rows);

  const structuredData = rows
    .map((row, index) => {
      const nama = cleanText(row[columns.nama]) || 'Tanpa Nama';
      const sekolah = normalizeSchool(row[columns.sekolah]);
      const kategori = cleanText(row[columns.kategori]) || 'Tidak Diketahui';
      const noWa = cleanText(row[columns.wa]) || '-';

      const lombaCandidates = columns.lomba
        .map((columnIndex) => cleanText(row[columnIndex]))
        .filter(Boolean)
        .flatMap((value) => value.split(',').map((item) => normalizeLomba(item)))
        .filter(Boolean);

      const lombas = [...new Set(lombaCandidates)];
      if (lombas.length === 0) {
        lombas.push('Belum Memilih Lomba');
      }

      return {
        id: index + 1,
        waktu: formatTimestamp(row[columns.timestamp], xlsx),
        nama,
        sekolah,
        kategori,
        noWa,
        lombas,
        lombaUtama: lombas[0],
      };
    })
    .filter((item) => item.nama !== 'Tanpa Nama');

  if (structuredData.length === 0) {
    throw new Error('Tidak ada data peserta yang berhasil dibaca. Pastikan sheet pertama berisi hasil respons Google Forms.');
  }

  const perKategori = countBy(structuredData, (item) => item.kategori);
  const sekolahCount = countBy(structuredData, (item) => item.sekolah);
  const lombaCount = structuredData.reduce((accumulator, item) => {
    item.lombas.forEach((lomba) => {
      accumulator[lomba] = (accumulator[lomba] || 0) + 1;
    });
    return accumulator;
  }, {});

  const totals = {
    peserta: structuredData.length,
    sekolah: Object.keys(sekolahCount).length,
    lomba: Object.keys(lombaCount).length,
    kategori: Object.keys(perKategori).length,
  };

  return {
    data: structuredData,
    stats: {
      headers,
      columnIndexes: columns,
      warnings,
      totals,
      perKategori,
      kategoriChartData: toChartData(perKategori),
      lombaChartData: toChartData(lombaCount, 10),
      sekolahChartData: toChartData(sekolahCount, 8),
      sekolahCount,
      insights: {
        sheetName: firstSheetName,
        rowCount: rows.length,
        normalizedSchoolCount: totals.sekolah,
        topSchool: toChartData(sekolahCount, 1)[0] || null,
        topLomba: toChartData(lombaCount, 1)[0] || null,
      },
    },
  };
};

export const parseExcel = async (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        resolve(await parseWorkbook(event.target.result, 'binary'));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('File tidak bisa dibaca di browser.'));
    reader.readAsBinaryString(file);
  });

export const parseExcelBuffer = async (arrayBuffer) => parseWorkbook(arrayBuffer, 'array');
