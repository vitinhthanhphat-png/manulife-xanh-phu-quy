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
- **Giải thích 3 loại Quỹ Hưng Thịnh** (ngay sau phần chọn quỹ để tiện tham khảo)
- Chú thích 3 loại tài sản

### Tab 2: Kế hoạch Tài chính
- **Smart Banner** phân biệt rõ 2 loại tỷ suất: "CÓ CAM KẾT" (Thưởng Tri Ân 2.5–5%/năm) vs "KHÔNG CAM KẾT" (đầu tư Quỹ 9%/1.3%)
- Modal giải thích chi tiết cho từng loại tỷ suất khi nhấn ℹ️
- Chọn mức phí đóng: 50 / 100 / 200 / 250 triệu/năm
- Chọn số năm đóng: 3 / 5 / 10 / 15 năm
- Smart badge gợi ý số năm đóng theo Quỹ đang chọn ở Tab 1
- Summary cards: Tổng phí, Năm rút tự do, Thưởng Tri Ân dự kiến
- Milestone timeline: Năm 3 → Năm 6 → Năm 20
- Toggle mô phỏng rút 10%/năm từ Năm thứ 11
- **Năm 20 Package Card**: Tổng lợi ích ước tính tại Năm 20 — hiển thị rõ vốn đã đóng, GTTK 2 kịch bản (9%/1.3%), Thưởng Tri Ân cam kết cộng thêm, ROI%, và phản ứng real-time với toggle rút tiền
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

### v2.5.3: Fee Engine Accuracy & Fee Breakdown UI (March 2026)
- **[Nâng cấp engine]** Phí Quản Lý Hợp Đồng chuyển từ hằng số cố định sang hàm động `getPolicyMgmtFee(năm)`: bắt đầu 47,000đ/tháng (2026), tăng +2,000đ/tháng mỗi năm, trần 70,000đ/tháng — trích từ **Tài Liệu Minh Hoạ Bán Hàng** của Manulife.
- **[Tính năng mới]** **Section Cấu Trúc Phí** (Section 4): hiển thị đầy đủ 5 loại phí (Phí Ban Đầu, QLHĐ, Chấm Dứt, QL Quỹ, Chuyển Đổi) dưới dạng 4 thẻ có màu sắc, số liệu theo năm, highlight đỏ/vàng/xanh.
- **[Cải tiến]** "Tổng thực nhận về" — cập nhật subtitle card Năm 20 và note cuối để rõ ràng đây là tiền nhận lại, không phải cộng thêm ngoài vốn đã đóng.
- **[Cải tiến]** Thêm indicator ⚡ hiển thị tổng phí rủi ro ước tính trừ trong 20 năm ngay trong panel Risk Fee, kèm **expandable giải thích** tại sao kịch bản 1.3% có thể không đổi khi toggle phí rủi ro.
- **[Cải tiến]** Chú thích nguồn gốc các mức phí sức khỏe ước tính (khảo sát thị trường VN 2024–2025) trực tiếp trên UI.
- **[Cải tiến]** Console log diagnostic giúp debug state phí rủi ro trong DevTools.

### v2.5.2: Bugfix — Risk Fee Toggle (March 2026)
- **[Sửa lỗi]** Bật/tắt toggle "Tính ước lượng Chi phí rủi ro & y tế" không ảnh hưởng đến con số khi đã bật "Mô phỏng rút tiền". Nguyên nhân: event binding bị fail silently và state không được sync lại từ DOM. Đã sửa bằng event delegation + DOM state sync mỗi lần `updateAll()`.
- **[Cải tiến]** Label "Tổng ước tính" đổi thành "Tổng thực nhận về" + cập nhật subtitle và note để tránh hiểu nhầm đây là tiền cộng thêm ngoài vốn đã đóng.
- **[Cải tiến]** Ghi rõ nguồn gốc 3 mức phí sức khỏe ước tính: khảo sát thị trường VN 2024–2025, không phải biểu phí chính thức Manulife.

### v2.5.1: Risk Fee & Health Riders Simulation (March 2026)
- **[Tính năng mới]** **Mô phỏng Phí Rủi Ro/Y tế**: Bổ sung tuỳ chọn "Tính ước lượng Chi phí rủi ro & y tế" cùng menu thả xuống để chọn "Gói sức khỏe đính kèm".
- **[Nâng cấp thuật toán]** Hệ thống dự phóng tài chính tự động tăng phí sinh mạng theo tuổi của khách hàng (hàm mũ 5% mỗi năm) cộng với phí cố định của thẻ sức khỏe đã chọn. Trừ các khoản hụt này mỗi đầu năm để thể hiện đúng bản chất sản phẩm liên kết đơn vị.
- **[Cảnh báo "Hết quỹ"]** Giao diện bảng lịch sử sẽ cảnh báo đỏ cực mạnh và hiện chữ "Hết quỹ" nếu GTTK về 0 do rút tiền hoặc bị trừ phí rủi ro lúc về già.

### v2.5.0: Year 20 Package Card & UI Refinements (March 2026)
- **[Tính năng mới]** **Năm 20 Package Card** — Thay thế widget Thưởng Tri Ân đơn lẻ bằng card tổng hợp hiển thị: (1) Tổng đã đóng làm vốn tham chiếu, (2) GTTK đầu tư 2 kịch bản 9%/1.3%, (3) Thưởng Tri Ân cam kết cộng thêm (với prefix "+"), (4) Tổng ước tính và % ROI so với vốn → Giải quyết nhầm lẫn khi khách nghĩ chỉ nhận 62 tr tại Năm 20.
- **[Tính năng mới]** Khi bật toggle rút tiền: hiện badge vàng "Chế độ rút 10%/năm", dòng "Đã rút về (Năm 11–20)", GTTK giảm tương ứng — trong khi Thưởng Tri Ân **không thay đổi** (cam kết độc lập), được ghi chú rõ ràng.
- **[Cải tiến]** Dời box "Giải thích 3 loại Quỹ Hưng Thịnh" lên ngay sau card chọn quỹ (trước biểu đồ) để dễ tham khảo hơn.
- **[Cải tiến]** Bỏ hậu tố "đ" trong tooltip biểu đồ (hiện "331 triệu" thay vì "331 triệu đ").

### v2.4.0: Smart Banner & Thưởng Tri Ân Calculator (March 2026)
- **[Tính năng mới]** **Smart Banner** đầu Tab 2 — phân biệt trực quan 2 loại tỷ suất: "🔒 CÓ CAM KẾT" (Thưởng Tri Ân, lãi suất 2.5–5%/năm) và "📈 KHÔNG CAM KẾT" (đầu tư Quỹ, 9%/1.3% minh họa).
- **[Tính năng mới]** **Modal giải thích** chi tiết cho từng loại tỷ suất khi nhấn ℹ️ — bao gồm bảng lãi suất cam kết theo số năm đóng phí và cảnh báo về tính chất không cam kết của GTTK đầu tư.
- **[Tính năng mới]** **Calculator Thưởng Tri Ân** (tiền thân của Năm 20 Package Card) — tính real-time khoản cam kết tại Năm 20 dựa trên lãi suất cam kết và Phí Ban Đầu tích lũy.

### v2.3.0: Historical Fund Dashboard + Tab Cross-Link (March 2026)
- **[Tính năng mới]** Section 3 — Dashboard lịch sử lợi nhuận thực tế các Quỹ Liên Kết Đơn Vị (Line Chart tương tác, toggle quỹ, stats cards, giải thích Glide Path, disclaimer pháp lý).
- **[Tính năng mới]** Kết nối 2 tab: callout giải thích 9% vs 1.3%, smart badge gợi ý số năm đóng theo Quỹ đang chọn ở Tab 1.
- **[Tính năng mới]** Toggle mô phỏng rút 10%/năm từ Năm thứ 11 trong Tab 2.
- **[Cải tiến]** Hiển thị "Hết quỹ" thay vì "—" khi tài khoản cạn kiệt ở kịch bản lãi thấp + rút tiền.
- **[Cải tiến]** Chú thích đầy đủ: cột bảng, loại Quỹ Hưng Thịnh, tài sản, Glide Path.

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
