let tableData = [];
let currentSortColumn = -1;
let currentSortOrder = '';
let selectedFilter = '';

function loadCSV(url) {
  return fetch(url)
    .then(response => response.text())
    .then(text => {
      const rows = text.trim().split('\n');
      return rows.map(row => row.split(','));
    });
}

function loadSheetData() {
  loadCSV('data/voice_actor_list.csv').then(data => {
    tableData = data;
    renderFilters();
    renderTable(data);
  });
}

function renderFilters() {
  const filtersBar = document.createElement('div');
  filtersBar.className = 'filters-bar';

  const nav = document.createElement('ul');
  nav.className = 'nav nav-center nav-bold nav-uppercase nav-pills';
  
  const dColumnIndex = 3;
  const uniqueDValues = [...new Set(tableData.slice(1).map(row => row[dColumnIndex]))];
  uniqueDValues.forEach(value => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.innerText = value;
    a.className = value === 'ずんだもん' ? 'zundamon' : '';
    a.onclick = () => filterByDColumn(value, a);
    li.appendChild(a);
    nav.appendChild(li);
  });

  // フィルタをリセットするボタンを追加
  const li = document.createElement('li');
  const resetA = document.createElement('a');
  resetA.innerText = '全て表示';
  resetA.className = 'reset-filter';
  resetA.onclick = () => {
    selectedFilter = '';
    renderTable(tableData);
    updateSelectedFilter();
  };
  li.appendChild(resetA);
  nav.appendChild(li);

  const searchBox = document.createElement('div');
  searchBox.className = 'search-box';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Search...';
  input.onkeyup = () => searchTable(input.value);
  searchBox.appendChild(input);

  filtersBar.appendChild(nav);
  filtersBar.appendChild(searchBox);
  document.body.insertBefore(filtersBar, document.getElementById('table-container'));
}

function filterByDColumn(value, element) {
  selectedFilter = value;
  const filteredData = tableData.filter((row, index) => index === 0 || row[3] === value);
  renderTable(filteredData);
  updateSelectedFilter(element);
}

function updateSelectedFilter(selectedElement) {
  const filterLinks = document.querySelectorAll('.filters-bar .nav a');
  filterLinks.forEach(link => {
    link.classList.remove('selected');
  });
  if (selectedElement) {
    selectedElement.classList.add('selected');
  }
}

function searchTable(query) {
  const lowerCaseQuery = query.toLowerCase();
  const filteredData = tableData.filter((row, index) => {
    if (index === 0) return true;
    return row.some(cell => cell.toString().toLowerCase().includes(lowerCaseQuery));
  });
  renderTable(filteredData);
}

function renderTable(data) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // データの最初の行を使用してテーブルヘッダーを作成
  const headerRow = document.createElement('tr');
  data[0].forEach((header, index) => {
    if ([0, 3, 4].includes(index)) { // A列、D列、E列のみ含める
      const th = document.createElement('th');
      th.innerText = header;
      th.onclick = () => sortTable(index);
      if (currentSortColumn === index) {
        th.className = currentSortOrder === 'asc' ? 'sort-asc' : 'sort-desc';
      }
      headerRow.appendChild(th);
    }
  });
  const th = document.createElement('th');
  th.innerText = 'コマンドコピー';
  headerRow.appendChild(th);
  thead.appendChild(headerRow);

  // テーブルの本体を作成
  data.slice(1).forEach(row => {
    const tr = document.createElement('tr');

    [0, 3, 4].forEach(index => { // A列、D列、E列のみ含める
      const td = document.createElement('td');
      td.innerText = row[index];
      if (index === 0) {
        td.style.minWidth = `${row[index].length * 8}px`; // 幅の調整
        td.style.textAlign = 'center'; // A列を中央揃え
      }
      tr.appendChild(td);
    });

    const copyButtonTd = document.createElement('td');
    copyButtonTd.style.width = '160px';
    const copyButton = document.createElement('button');
    copyButton.innerText = 'Copy to Clipboard';
    copyButton.className = 'copy-button';
    copyButton.onclick = () => copyToClipboard(row[5]); // F列のデータをコピー
    copyButtonTd.appendChild(copyButton);
    tr.appendChild(copyButtonTd);

    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  document.getElementById('table-container').innerHTML = ''; // 前の内容をクリア
  document.getElementById('table-container').appendChild(table);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert('設定コマンドをクリップボードにコピーしたよ！\nDiscordのチャットに貼り付けて実行してね！');
  }).catch(err => {
    console.error('コマンドのコピーに失敗したみたい・・・', err);
  });
}

function sortTable(columnIndex) {
  let sortedData;
  if (currentSortColumn === columnIndex) {
    currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    currentSortColumn = columnIndex;
    currentSortOrder = 'asc';
  }
  if (currentSortOrder === 'asc') {
    sortedData = [...tableData.slice(1)].sort((a, b) => a[columnIndex].localeCompare(b[columnIndex]));
  } else {
    sortedData = [...tableData.slice(1)].sort((a, b) => b[columnIndex].localeCompare(a[columnIndex]));
  }
  renderTable([tableData[0], ...sortedData]);
}

window.onload = loadSheetData;
