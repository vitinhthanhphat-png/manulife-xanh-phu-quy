# Hung Thinh Bar Chart — Manulife Xanh Phú Quý

> WordPress plugin — Biểu đồ cột tương tác & Kế hoạch Tài chính cho sản phẩm **Xanh Phú Quý** (Manulife Vietnam)

## 📋 Mô tả

> ⚠️ **Nguồn dữ liệu & Độ chính xác:** Toàn bộ plugin được xây dựng dựa trên tài liệu chính thức từ trang chủ Manulife Việt Nam — *Sản phẩm Xanh Phú Quý* — được phân tích và lập trình nhằm giúp khách hàng có cái nhìn trực quan hơn về sản phẩm. Nếu phát hiện bất kỳ thông tin không chính xác trong cách tính toán hoặc kiến thức tài chính, rất mong bạn phản hồi ngay để chúng tôi có thể cập nhật kịp thời.

Plugin tương tác gồm **2 Tab + 1 Section**:

### Tab 1: Phân bổ Tài sản
- Nhập tuổi (slider + number input đồng bộ)
- Chọn Quỹ nghỉ hưu: 2035 / 2040 / 2045
- Time slider kéo từng năm → Bar Chart 3 cột animate (Cổ phiếu / Trái phiếu / Tiền tệ)
- Text mô tả động theo năm và tuổi
- Chú thích 3 loại tài sản và giải thích 3 loại Quỹ Hưng Thịnh

### Tab 2: Kế hoạch Tài chính
- Chọn mức phí đóng: 50 / 100 / 200 / 250 triệu/năm
- Chọn số năm đóng: 3 / 5 / 10 / 15 năm
- Smart badge gợi ý số năm đóng theo Quỹ đang chọn ở Tab 1
- Summary cards: Tổng phí, Năm rút tự do, Thưởng Tri Ân
- Milestone timeline: Năm 3 → Năm 6 → Năm 20
- Toggle mô phỏng rút 10%/năm từ Năm thứ 11
- Dual-rate Line Chart: Tỷ suất 9% vs 1.3%/năm
- Bảng chi tiết theo từng năm + chú thích cột
- Callout giải thích 9% vs 1.3% và link sang Tab 1

### Section 3: Lịch sử Lợi nhuận Thực tế Các Quỹ
- Line Chart tương tác: 4 Quỹ Liên Kết Đơn Vị (2020–2024)
- Toggle ẩn/hiện từng quỹ và stats cards (năm tốt nhất/khó nhất)
- Giải thích Glide Path: mối liên hệ giữa 4 quỹ thành phần và Quỹ Hưng Thịnh
- Disclaimer pháp lý bắt buộc

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

## 🔄 Theo dõi thay đổi (Changelog)

### v2.3.0: Historical Fund Dashboard + Tab Cross-Link (March 2026)
- **[Tính năng mới]** Section 3 — Dashboard lịch sử lợi nhuận thực tế các Quỹ Liên Kết Đơn Vị (Line Chart tương tác, toggle quỹ, stats cards, giải thích Glide Path, disclaimer pháp lý).
- **[Tính năng mới]** Kết nối 2 tab: callout giải thích 9% vs 1.3%, smart badge gợi ý số năm đóng theo Quỹ đang chọn ở Tab 1.
- **[Tính năng mới]** Toggle mô phỏng rút 10%/năm từ Năm thứ 11 trong Tab 2.
- **[Cải tiến]** Hiển thị "Hết quỹ" thay vì "—" khi tài khoản cạn kiệt ở kịch bản lãi thấp + rút tiền.
- **[Cải tiến]** Chú thích đầy đủ: cột bảng, loại Quỹ Hưng Thịnh, tài sản, Glide Path.
- **[Cải tiến]** Bỏ hậu tố "đ" thừa trong bảng và summary cards.

### v2.2.1: OTA Updates via GitHub (March 2026)
- **[Tính năng mới]** Tích hợp tính năng cập nhật tự động (OTA) qua GitHub, cho phép User tải bản mới trực tiếp trong khu vực Plugins (WP Admin).

### v2.2.0: Admin Settings & Mobile UX
- **[Tính năng mới]** Thêm trang cài đặt (Settings Panel) trong WP Admin.
- **[Tính năng mới]** Cho phép upload Avatar và Logo Tùy chỉnh trực tiếp từ Media Library.
- **[Tính năng mới]** Cho phép tự điền thông tin Chuyên Gia (Tên, Chức vụ, Phone, Email, Mã Đại Lý).
- **[Tính năng mới]** Thêm quy trình gỡ cài đặt (Uninstall Hook) tự động dọn dẹp Database (Xóa Options).
- **[Cải tiến]** Tối ưu hóa giao diện di động (Mobile Responsive) cho Banner Chuyên gia.

## 📄 License

GPL-2.0-or-later
