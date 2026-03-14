# Hung Thinh Bar Chart — Manulife Xanh Phú Quý

> WordPress plugin — Biểu đồ cột tương tác & Kế hoạch Tài chính cho sản phẩm **Xanh Phú Quý** (Manulife Vietnam)

## 📋 Mô tả

Plugin tương tác gồm **2 Tab**:

### Tab 1: Phân bổ Tài sản
- Nhập tuổi (slider + number input đồng bộ)  
- Chọn Quỹ nghỉ hưu: 2035 / 2040 / 2045  
- Time slider kéo từng năm → Bar Chart 3 cột animate (Cổ phiếu / Trái phiếu / Tiền tệ)  
- Text mô tả động theo năm và tuổi

### Tab 2: Kế hoạch Tài chính
- Chọn mức phí đóng: 50 / 100 / 200 / 250 triệu/năm  
- Chọn số năm đóng: 3 / 5 / 10 / 15 năm  
- Summary cards: Tổng phí, Năm rút tự do, Thưởng Tri Ân  
- Milestone timeline: Năm 3 → Năm 6 → Năm 20  
- Dual-rate Line Chart: Tỷ suất 9% vs 1.3%/năm  
- Bảng chi tiết theo từng năm với phí chấm dứt và số tiền có thể rút

## 🗂️ Cấu trúc

```
manulife-xanh-phu-quy/
├── hung-thinh-bar-chart.php       # Plugin main file + Shortcode
├── data/
│   └── funds.json                 # Fund allocation data (2035/2040/2045)
└── assets/
    ├── css/hung-thinh-chart.css   # Styles (Manulife brand)
    └── js/hung-thinh-chart.js     # Chart.js logic + financial engine
```

## ⚡ Cài đặt

1. Upload thư mục `manulife-xanh-phu-quy` vào `wp-content/plugins/`
2. Kích hoạt plugin trong **WP Admin → Plugins**
3. Chèn shortcode vào page/post:

```
[hung_thinh_bar_chart]
```

## 🛠️ Dependencies (CDN)

- [Chart.js 4.4.3](https://www.chartjs.org/)
- [chartjs-plugin-datalabels 2.2.0](https://chartjs-plugin-datalabels.netlify.app/)
- [Inter font](https://fonts.google.com/specimen/Inter) (Google Fonts)

## 📊 Data Source

Dữ liệu tỷ lệ phân bổ tài sản và quy tắc tài chính trích từ tài liệu chính thức:  
**Tài Liệu Minh Họa Bán Hàng — Sản phẩm Xanh Phú Quý (Manulife Vietnam)**

## ⚠️ Disclaimer

Biểu đồ và số liệu mang tính **minh họa**, không phải cam kết lợi nhuận.  
Tỷ suất đầu tư giả định (9%/năm và 1.3%/năm) không được Manulife bảo đảm.

## 📄 License

GPL-2.0-or-later
