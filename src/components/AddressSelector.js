import React, { useState, useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

// 高德地图API密钥和安全密钥
const MAP_API_KEY = '17fda18032b25c49faae49a26cbf2e3e';
const MAP_SECURE_KEY = '6e01241a781e1a45945f791efdf2d05e';

const AddressSelector = ({ onAddressSelect }) => {
  const [address, setAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [placeSearch, setPlaceSearch] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const mapContainer = useRef(null);
  const resultsPanel = useRef(null);
  
  // 初始化高德地图
  useEffect(() => {
    if (showMap && !mapInstance) {
      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: MAP_SECURE_KEY
      };
      
      AMapLoader.load({
        key: MAP_API_KEY,
        version: '2.0',
        plugins: ['AMap.Geocoder', 'AMap.PlaceSearch', 'AMap.Geolocation']
      }).then((AMap) => {
        // 创建地图实例
        const map = new AMap.Map(mapContainer.current, {
          zoom: 13,
          resizeEnable: true
        });
        
        // 创建标记点
        const newMarker = new AMap.Marker({
          position: map.getCenter(),
          draggable: true,
          animation: 'AMAP_ANIMATION_DROP'
        });
        
        newMarker.setMap(map);
        
        // 创建POI搜索实例
        const search = new AMap.PlaceSearch({
          pageSize: 10,         // 单页显示结果条数
          pageIndex: 1,         // 页码
          city: '全国',          // 兴趣点城市
          citylimit: false,     // 是否强制限制在设置的城市内搜索
          map: map,             // 展现结果的地图实例
          autoFitView: true,    // 是否自动调整地图视野使绘制的Marker点都处于视口的可见范围
        });
        
        setPlaceSearch(search);
        
        // 标记拖动结束后更新位置
        newMarker.on('dragend', () => {
          const lnglat = newMarker.getPosition();
          updateCoordinates(lnglat);
          reverseGeocode(AMap, lnglat);
        });
        
        // 点击地图更新标记位置
        map.on('click', (e) => {
          newMarker.setPosition(e.lnglat);
          updateCoordinates(e.lnglat);
          reverseGeocode(AMap, e.lnglat);
        });
        
        // 获取用户当前位置
        map.plugin('AMap.Geolocation', () => {
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true,
            timeout: 10000
          });
          
          map.addControl(geolocation);
          
          geolocation.getCurrentPosition((status, result) => {
            if (status === 'complete') {
              map.setCenter(result.position);
              newMarker.setPosition(result.position);
              updateCoordinates(result.position);
              reverseGeocode(AMap, result.position);
            }
          });
        });
        
        console.log('mapInstance', mapInstance);
        setMapInstance(map);
        setMarker(newMarker);
      }).catch(e => {
        console.error('地图初始化错误', e);
      });
    }
  }, [showMap, mapInstance]);
  
  // 更新经纬度信息
  const updateCoordinates = (lnglat) => {
    setCoordinates({
      lng: lnglat.lng.toFixed(6),
      lat: lnglat.lat.toFixed(6)
    });
  };
  
  // 根据坐标进行逆地理编码，获取地址信息
  const reverseGeocode = (AMap, lnglat) => {
    const geocoder = new AMap.Geocoder();
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        const addressComponent = result.regeocode.addressComponent;
        const address = result.regeocode.formattedAddress;
        
        setSelectedPoi({
          name: address,
          address: address,
          location: lnglat,
          district: addressComponent.district,
          city: addressComponent.city,
          province: addressComponent.province
        });
        
        setAddress(address);
      }
    });
  };
  
  // 根据关键字搜索地点
  const searchPlaces = (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setAddress(keyword);
    
    console.log('searchPlaces', keyword);
    console.log('placeSearch', placeSearch);
    console.log('mapInstance', mapInstance);
    if (placeSearch && mapInstance) {
      // 使用高德地图的PlaceSearch进行搜索
      placeSearch.search(keyword, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          // 更新搜索结果列表
          setSearchResults(result.poiList.pois);
        } else {
          setSearchResults([]);
        }
      });
    }
  };
  
  // 从搜索结果中选择地点
  const handleSelectPlace = (poi) => {
    setSelectedPoi(poi);
    setAddress(poi.name);
    setSearchResults([]);
    
    if (mapInstance && marker) {
      const position = new window.AMap.LngLat(poi.location.lng, poi.location.lat);
      mapInstance.setCenter(position);
      marker.setPosition(position);
      updateCoordinates(position);
    }
    
    // 通知父组件所选地址
    onAddressSelect({
      address: poi.name,
      fullAddress: `${poi.province || ''}${poi.city || ''}${poi.district || ''}${poi.address || ''}${poi.name}`,
      location: coordinates ? {
        lng: parseFloat(coordinates.lng),
        lat: parseFloat(coordinates.lat)
      } : poi.location
    });
  };
  
  // 确认所选地址
  const confirmAddress = () => {
    if (selectedPoi) {
      onAddressSelect({
        address: selectedPoi.name,
        fullAddress: selectedPoi.address,
        location: coordinates ? {
          lng: parseFloat(coordinates.lng),
          lat: parseFloat(coordinates.lat)
        } : selectedPoi.location
      });
      setShowMap(false);
    }
  };
  
  // 处理输入框变化
  const handleInputChange = (e) => {
    console.log('handleInputChange', e.target.value);
    const value = e.target.value;
    setAddress(value);
    searchPlaces(value);
  };
  
  // 清空当前搜索
  const clearSearch = () => {
    setAddress('');
    setSearchResults([]);
  };
  
  return (
    <div className="address-selector">
      <div className="address-input-container">
        <input
          type="text"
          className="address-input"
          placeholder="输入配送地址"
          value={address}
          onChange={handleInputChange}
          onClick={() => setShowMap(true)}
        />
        {address && (
          <button className="clear-input-btn" onClick={clearSearch}>×</button>
        )}
      </div>
      
      {showMap && (
        <div className="map-modal-overlay">
          <div className="map-modal">
            <div className="map-modal-header">
              <h3>选择配送地址</h3>
              <button className="close-btn" onClick={() => setShowMap(false)}>×</button>
            </div>
            
            <div className="map-search-container">
              <input
                type="text"
                className="map-search-input"
                placeholder="搜索地址、小区、写字楼、学校等"
                value={address}
                onChange={handleInputChange}
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((poi) => (
                  <div 
                    key={poi.id} 
                    className="search-result-item"
                    onClick={() => handleSelectPlace(poi)}
                  >
                    <div className="result-name">{poi.name}</div>
                    <div className="result-address">{poi.address || `${poi.district}${poi.businessArea}`}</div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="map-container" ref={mapContainer}></div>
            <div id="panel" ref={resultsPanel} className="results-panel"></div>
            
            <div className="map-footer">
              <div className="selected-location">
                {selectedPoi && (
                  <div className="selected-address-preview">
                    <div className="selected-address-text">{selectedPoi.name}</div>
                    {coordinates && (
                      <div className="coordinates-display">
                        经度: {coordinates.lng}, 纬度: {coordinates.lat}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button 
                className="confirm-address-btn"
                onClick={confirmAddress}
                disabled={!selectedPoi}
              >
                确认地址
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector; 