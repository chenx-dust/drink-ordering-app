import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>页面不存在</h2>
        <p>抱歉，您访问的页面不存在或已被移除</p>
        <Link to="/" className="back-home-btn">
          返回首页
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 