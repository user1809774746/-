(function () {
  let map, autoComplete, placeSearch, geolocation;
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const suggestList = document.getElementById('suggestList');
  const poiList = document.getElementById('poiList');
  const toast = document.getElementById('toast');

  const locateBtn = document.getElementById('locateBtn');
  const nearbyBtn = document.getElementById('nearbyBtn');
  const routeBtn = document.getElementById('routeBtn');

  function showToast(msg, ms = 1800) {
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, ms);
  }

  function initMap() {
    map = new AMap.Map('map', {
      viewMode: '2D',
      zoom: 14,
      center: [116.397428, 39.90923], // 默认北京天安门
    });

    AMap.plugin(['AMap.AutoComplete', 'AMap.PlaceSearch', 'AMap.Geolocation'], () => {
      autoComplete = new AMap.AutoComplete({ city: '全国' });
      placeSearch = new AMap.PlaceSearch({ city: '全国', map });
      geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        position: 'RB',
      });

      map.addControl(geolocation);
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete' && result.position) {
          map.setCenter(result.position);
          showToast('已定位到当前位置');
        } else {
          showToast('定位失败，使用默认位置');
        }
      });
    });

    bindUI();
  }

  function bindUI() {
    // 输入建议
    let suggestTimer = 0;
    searchInput.addEventListener('input', () => {
      const kw = searchInput.value.trim();
      clearTimeout(suggestTimer);
      if (!kw) { suggestList.style.display = 'none'; return; }
      suggestTimer = setTimeout(() => {
        autoComplete.search(kw, (status, result) => {
          if (status !== 'complete' || !result.tips) { suggestList.style.display = 'none'; return; }
          renderSuggest(result.tips.slice(0, 10));
        });
      }, 200);
    });

    // 点击搜索
    searchBtn.addEventListener('click', () => doSearch(searchInput.value.trim()));

    // 分类快速搜索
    document.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const cat = chip.dataset.cat;
        searchInput.value = cat;
        doSearch(cat);
      });
    });

    // FAB
    locateBtn.addEventListener('click', () => {
      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete' && result.position) {
          map.setCenter(result.position);
          showToast('定位成功');
        } else {
          showToast('定位失败');
        }
      });
    });

    nearbyBtn.addEventListener('click', () => {
      const center = map.getCenter();
      placeSearch.searchNearBy('景点', center, 2000, (status, result) => {
        if (status === 'complete' && result.poiList) {
          renderPoiList(result.poiList.pois);
          showToast('已为你查找附近景点');
        } else {
          showToast('未找到附近景点');
        }
      });
    });

    routeBtn.addEventListener('click', () => {
      showToast('路线规划功能可接入 AMap.Route。此示例暂不实现。');
    });

    // 底部探索
    const navExplore = document.getElementById('navExplore');
    navExplore.addEventListener('click', () => {
      const center = map.getCenter();
      placeSearch.searchNearBy('餐饮', center, 1500, (status, result) => {
        if (status === 'complete' && result.poiList) {
          renderPoiList(result.poiList.pois);
          showToast('探索：附近餐饮');
        } else {
          showToast('未找到附近餐饮');
        }
      });
    });
  }

  function renderSuggest(tips) {
    suggestList.innerHTML = tips.map(t => `
      <div class="suggest-item" data-name="${t.name || ''}" data-adcode="${t.adcode || ''}" data-location="${(t.location && (t.location.lng + ',' + t.location.lat)) || ''}">
        <span>${t.name || ''}</span>
        <small>${t.district || ''} ${t.address || ''}</small>
      </div>
    `).join('');
    suggestList.style.display = 'block';

    Array.from(suggestList.children).forEach(item => {
      item.addEventListener('click', () => {
        const name = item.getAttribute('data-name');
        suggestList.style.display = 'none';
        searchInput.value = name;
        doSearch(name);
      });
    });
  }

  function doSearch(keyword) {
    if (!keyword) { showToast('请输入关键词'); return; }
    placeSearch.search(keyword, (status, result) => {
      if (status === 'complete' && result.poiList) {
        renderPoiList(result.poiList.pois);
        showToast(`为你找到 ${result.poiList.count} 条结果`);
      } else {
        poiList.style.display = 'none';
        showToast('未找到相关结果');
      }
    });
  }

  function renderPoiList(pois) {
    poiList.innerHTML = pois.map(poi => `
      <div class="poi-item" data-lng="${poi.location && poi.location.lng}" data-lat="${poi.location && poi.location.lat}">
        <div class="name">${poi.name || ''}</div>
        <div class="addr">${poi.address || ''}</div>
      </div>
    `).join('');
    poiList.style.display = 'block';

    Array.from(poiList.children).forEach(item => {
      item.addEventListener('click', () => {
        const lng = parseFloat(item.getAttribute('data-lng'));
        const lat = parseFloat(item.getAttribute('data-lat'));
        if (!isNaN(lng) && !isNaN(lat)) {
          map.setZoomAndCenter(16, [lng, lat]);
          new AMap.Marker({ position: [lng, lat], map });
        }
      });
    });
  }

  // 初始化
  if (window.AMap) {
    initMap();
  } else {
    alert('高德地图 SDK 未加载，请检查网络或替换正确的 Key');
  }
})();