/**
 * 地址选择器组件
 * 集成高德地图API，提供地址搜索、地图选点和地理编码功能
 * 支持用户当前位置定位和地址确认
 */

import React, { useState, useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';

// 高德地图配置
const MAP_API_KEY = process.env.REACT_APP_AMAP_API_KEY;
const MAP_SECURE_KEY = process.env.REACT_APP_AMAP_SECURE_KEY;

// 如果没有配置环境变量，显示错误信息
if (!MAP_API_KEY || !MAP_SECURE_KEY) {
  console.error('请在.env文件中配置高德地图API密钥：REACT_APP_AMAP_API_KEY和REACT_APP_AMAP_SECURE_KEY');
}

/**
 * AddressSelector组件
 * @param {Function} onSelect - 地址选择回调函数，接收地址文本和坐标
 */
const AddressSelector = ({ onSelect }) => {
  // 状态管理
  const [addresses, setAddresses] = useState([]); // 地址列表
  const [selectedAddress, setSelectedAddress] = useState(null); // 选中的地址
  const [showMap, setShowMap] = useState(false); // 地图显示状态
  const [mapCenter, setMapCenter] = useState({ lat: 39.9042, lng: 116.4074 }); // 地图中心点，默认北京
  const [selectedLocation, setSelectedLocation] = useState(null); // 选中的坐标
  const [searchResults, setSearchResults] = useState([]); // 搜索结果
  const [mapInstance, setMapInstance] = useState(null); // 地图实例
  const [marker, setMarker] = useState(null); // 地图标记点
  const [placeSearch, setPlaceSearch] = useState(null); // POI搜索实例
  const [coordinates, setCoordinates] = useState(null); // 当前坐标
  
  // DOM引用
  const mapContainer = useRef(null); // 地图容器
  const resultsPanel = useRef(null); // 搜索结果面板
  
  /**
   * 初始化高德地图
   * 加载地图API，创建地图实例和相关插件
   */
  useEffect(() => {
    if (showMap && !mapInstance) {
      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: MAP_SECURE_KEY
      };
      
      // 加载高德地图API
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
        
        // 创建可拖动的标记点
        const newMarker = new AMap.Marker({
          position: map.getCenter(),
          draggable: true,
          animation: 'AMAP_ANIMATION_DROP'
        });
        
        newMarker.setMap(map);
        
        // 初始化POI搜索
        const search = new AMap.PlaceSearch({
          pageSize: 10,         // 单页显示结果条数
          pageIndex: 1,         // 页码
          city: '全国',          // 兴趣点城市
          citylimit: false,     // 是否强制限制在设置的城市内搜索
          map: map,             // 展现结果的地图实例
          autoFitView: true,    // 自动调整视野
        });
        
        setPlaceSearch(search);
        
        // 监听标记拖动结束事件
        newMarker.on('dragend', () => {
          const lnglat = newMarker.getPosition();
          updateCoordinates(lnglat);
          reverseGeocode(AMap, lnglat);
        });
        
        // 监听地图点击事件
        map.on('click', (e) => {
          newMarker.setPosition(e.lnglat);
          updateCoordinates(e.lnglat);
          reverseGeocode(AMap, e.lnglat);
        });
        
        // 获取用户当前位置
        map.plugin('AMap.Geolocation', () => {
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位
            timeout: 10000           // 超时时间
          });
          
          map.addControl(geolocation);
          
          // 获取当前位置并更新地图
          geolocation.getCurrentPosition((status, result) => {
            if (status === 'complete') {
              map.setCenter(result.position);
              newMarker.setPosition(result.position);
              updateCoordinates(result.position);
              reverseGeocode(AMap, result.position);
            }
          });
        });
        
        setMapInstance(map);
        setMarker(newMarker);
      }).catch(e => {
        console.error('地图初始化错误', e);
      });
    }
  }, [showMap, mapInstance]);
  
  /**
   * 更新经纬度信息
   * @param {Object} lnglat - 包含经纬度的对象
   */
  const updateCoordinates = (lnglat) => {
    setCoordinates({
      lng: lnglat.lng.toFixed(6),
      lat: lnglat.lat.toFixed(6)
    });
  };
  
  /**
   * 根据坐标进行逆地理编码
   * 将经纬度转换为详细地址信息
   * @param {Object} AMap - 高德地图API实例
   * @param {Object} lnglat - 经纬度对象
   */
  const reverseGeocode = (AMap, lnglat) => {
    const geocoder = new AMap.Geocoder();
    geocoder.getAddress(lnglat, (status, result) => {
      if (status === 'complete' && result.info === 'OK') {
        const addressComponent = result.regeocode.addressComponent;
        const address = result.regeocode.formattedAddress;
        
        // 更新选中的地址信息
        setSelectedAddress({
          name: address,
          address: address,
          location: lnglat,
          district: addressComponent.district,
          city: addressComponent.city,
          province: addressComponent.province
        });
        
        setAddresses([{
          text: address,
          location: lnglat
        }]);
      }
    });
  };
  
  /**
   * 根据关键字搜索地点
   * @param {string} keyword - 搜索关键字
   */
  const searchPlaces = (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setAddresses([{
      text: keyword,
      location: null
    }]);
    
    if (placeSearch && mapInstance) {
      // 使用高德地图的POI搜索
      placeSearch.search(keyword, (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          setSearchResults(result.poiList.pois);
        } else {
          setSearchResults([]);
        }
      });
    }
  };
  
  /**
   * 处理地点选择
   * @param {Object} poi - 选中的地点信息
   */
  const handleSelectPlace = (poi) => {
    setSelectedAddress(poi);
    setAddresses([{
      text: poi.name,
      location: poi.location
    }]);
    setSearchResults([]);
    
    // 更新地图显示
    if (mapInstance && marker) {
      const position = new window.AMap.LngLat(poi.location.lng, poi.location.lat);
      mapInstance.setCenter(position);
      marker.setPosition(position);
      updateCoordinates(position);
    }
    
    // 通知父组件
    onSelect(poi.name, poi.location || selectedLocation || mapCenter);
  };
  
  /**
   * 确认选择的地址
   */
  const confirmAddress = () => {
    if (selectedAddress) {
      onSelect(selectedAddress.name, selectedAddress.location || selectedLocation || mapCenter);
      setShowMap(false);
    }
  };
  
  /**
   * 处理搜索输入变化
   * @param {Event} e - 输入事件对象
   */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAddresses([{
      text: value,
      location: null
    }]);
    searchPlaces(value);
  };

  const handleMapClick = (e) => {
    const location = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    setSelectedLocation(location);
    // 如果已经选择了地址，更新它的位置
    if (selectedAddress) {
      onSelect(selectedAddress.name, location);
    }
  };

  return (
    <div className="address-selector">
      <div className="address-input-container">
        <input
          type="text"
          className="address-input"
          placeholder="输入配送地址"
          value={addresses.map(a => a.text).join(', ')}
          onChange={handleInputChange}
          onClick={() => setShowMap(true)}
          required
        />
        {addresses.length > 0 && (
          <button className="clear-input-btn" onClick={() => {
            setAddresses([]);
            setSearchResults([]);
          }}>×</button>
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
                value={addresses.map(a => a.text).join(', ')}
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
            
            <div className="map-container" ref={mapContainer} onClick={handleMapClick}></div>
            <div id="panel" ref={resultsPanel} className="results-panel"></div>
            
            <div className="map-footer">
              <div className="selected-location">
                {selectedAddress && (
                  <div className="selected-address-preview">
                    <div className="selected-address-text">{selectedAddress.name}</div>
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
                disabled={!selectedAddress}
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