# 饮品订购系统 (Drink Ordering App)

一个现代化的饮品在线订购系统，前端使用 React，后端使用 Rust 构建。

## 功能特点

- 🍹 饮品浏览和分类展示
- 🛒 购物车管理
- 💳 在线下单和支付
- 📍 高德地图定位配送
- 🔄 实时订单状态跟踪
- 👨‍💼 管理员后台订单管理
- 📦 串口交互能力

## 技术栈

### 前端

- React 18
- React Router v6 (路由管理)
- Context API (状态管理)
- 高德地图 JavaScript API

### 后端

- Rust
- SQLite 数据库

## 快速开始

### 环境要求

- Node.js >= 14
- Rust >= 1.70
- npm 或 yarn

### 安装步骤

1. 克隆项目

    ```bash
    git clone [项目地址]
    cd drink-ordering-app
    ```

2. 安装前端依赖

    ```bash
    npm install
    ```

3. 安装后端依赖

    ```bash
    cd server
    cargo build
    ```

4. 启动开发服务器

    ```bash
    # 在项目根目录下
    npm run dev
    ```

这将同时启动：

- 前端开发服务器 (http://localhost:3000)
- 后端 API 服务器 (http://localhost:3001)

## 项目结构

```plaintext
drink-ordering-app/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── admin/             # 管理后台
│   └── data/              # 静态数据
├── server/                 # Rust 后端
│   └── src/               # 后端源代码
├── public/                # 静态资源
└── package.json           # 项目配置
```

## 主要功能模块

1. 用户界面
   - 饮品分类浏览
   - 购物车管理
   - 订单确认和支付
   - 配送地址选择

2. 订单管理
   - 订单状态跟踪
   - 历史订单查询
   - 订单详情查看

3. 管理后台
   - 订单处理
   - 菜单管理
   - 数据统计

## 开发指南

### 前端开发

- 使用 `npm start` 启动前端开发服务器
- 使用 `npm run build` 构建生产版本

### 后端开发

- 使用 `cargo run` 启动后端服务器
- 使用 `cargo test` 运行测试

## 部署

1. 构建前端

```bash
npm run build
```

2. 构建后端

```bash
cd server
cargo build --release
```

## 许可证

[MIT License](LICENSE)
