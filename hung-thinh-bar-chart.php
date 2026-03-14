<?php
/**
 * Plugin Name: Hung Thinh Bar Chart - Xanh Phu Quy
 * Plugin URI:  https://manulife.com.vn
 * Description: Biểu đồ cột tương tác + Kế hoạch tài chính của Quỹ Hưng Thịnh (Sản phẩm Xanh Phú Quý - Manulife).
 * Version:     2.0.0
 * Author:      Manulife Vietnam
 * License:     GPL-2.0-or-later
 * Text Domain: hung-thinh-bar-chart
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'HTHBC_VERSION', '2.0.0' );
define( 'HTHBC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'HTHBC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

function hthbc_enqueue_assets() {
    wp_enqueue_script(
        'chart-js',
        'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
        array(), '4.4.3', true
    );
    wp_enqueue_script(
        'chartjs-plugin-datalabels',
        'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js',
        array( 'chart-js' ), '2.2.0', true
    );
    wp_enqueue_style(
        'hung-thinh-chart-css',
        HTHBC_PLUGIN_URL . 'assets/css/hung-thinh-chart.css',
        array(), HTHBC_VERSION
    );
    wp_enqueue_script(
        'hung-thinh-chart-js',
        HTHBC_PLUGIN_URL . 'assets/js/hung-thinh-chart.js',
        array( 'chart-js', 'chartjs-plugin-datalabels' ), HTHBC_VERSION, true
    );

    $funds_json_path = HTHBC_PLUGIN_DIR . 'data/funds.json';
    $funds_data      = array();
    if ( file_exists( $funds_json_path ) ) {
        $funds_data = json_decode( file_get_contents( $funds_json_path ), true );
    }

    wp_localize_script( 'hung-thinh-chart-js', 'hthbcData', array(
        'funds'       => $funds_data,
        'currentYear' => (int) date( 'Y' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'hthbc_enqueue_assets' );

/**
 * Shortcode: [hung_thinh_bar_chart]
 */
function hthbc_render_shortcode( $atts ) {
    ob_start();
    ?>
    <div class="hthbc-wrapper" id="hung-thinh-bar-chart">

        <!-- ── Tab Navigation ─────────────────────────── -->
        <div class="hthbc-tabs">
            <button class="hthbc-tab-btn active" data-tab="allocation" id="hthbc-tab-allocation">
                <span class="hthbc-tab-icon">📊</span>
                <span>Phân bổ Tài sản</span>
            </button>
            <button class="hthbc-tab-btn" data-tab="financial" id="hthbc-tab-financial">
                <span class="hthbc-tab-icon">💰</span>
                <span>Kế hoạch Tài chính</span>
            </button>
        </div>

        <!-- ═══════════════════════════════════════════════
             TAB 1: Phân bổ Tài sản (Bar Chart)
        ════════════════════════════════════════════════ -->
        <div class="hthbc-tab-content active" id="hthbc-pane-allocation">

            <div class="hthbc-form-card">
                <h3 class="hthbc-form-title">Khám phá Hành Trình Đầu Tư Của Bạn</h3>
                <p class="hthbc-form-subtitle">Quỹ Hưng Thịnh tự động điều chỉnh danh mục để bảo toàn vốn khi bạn đến gần tuổi hưu</p>

                <div class="hthbc-field-group">
                    <label class="hthbc-label" for="hthbc-age-slider">
                        Độ tuổi hiện tại: <span class="hthbc-age-display" id="hthbc-age-display">30</span>
                    </label>
                    <div class="hthbc-age-controls">
                        <input type="range" id="hthbc-age-slider" class="hthbc-range-slider"
                            min="18" max="65" value="30" step="1" aria-label="Tuổi hiện tại">
                        <input type="number" id="hthbc-age-number" class="hthbc-number-input"
                            min="18" max="65" value="30" aria-label="Nhập tuổi">
                    </div>
                </div>

                <div class="hthbc-field-group">
                    <label class="hthbc-label" for="hthbc-fund-select">Năm dự kiến nghỉ hưu</label>
                    <select id="hthbc-fund-select" class="hthbc-select">
                        <option value="2035">Quỹ Hưng Thịnh 2035</option>
                        <option value="2040">Quỹ Hưng Thịnh 2040</option>
                        <option value="2045" selected>Quỹ Hưng Thịnh 2045</option>
                    </select>
                </div>
            </div>

            <div class="hthbc-time-section">
                <div class="hthbc-time-header">
                    <span class="hthbc-time-label" id="hthbc-year-start">2026</span>
                    <span class="hthbc-time-title">Kéo để xem tỷ lệ theo từng năm</span>
                    <span class="hthbc-time-label" id="hthbc-year-end">2045</span>
                </div>
                <input type="range" id="hthbc-time-slider" class="hthbc-time-slider"
                    min="2026" max="2045" value="2026" step="1" aria-label="Thanh trượt năm">
                <div class="hthbc-time-info">
                    <span class="hthbc-time-badge" id="hthbc-time-badge">📅 Năm 2026</span>
                    <span class="hthbc-age-info" id="hthbc-age-info">Lúc bạn <strong>30</strong> tuổi</span>
                </div>
            </div>

            <div class="hthbc-chart-section">
                <div class="hthbc-chart-container">
                    <canvas id="hthbc-canvas" aria-label="Biểu đồ tỷ lệ phân bổ tài sản"></canvas>
                </div>
                <p class="hthbc-narrative" id="hthbc-narrative"></p>
            </div>

            <div class="hthbc-disclaimer">
                <p>Lưu ý: Biểu đồ cột minh họa dựa trên giới hạn tỷ lệ phân bổ tài sản đầu tư tối đa của Quỹ Hưng Thịnh. Tỷ trọng đầu tư thực tế sẽ được chuyên gia Manulife linh hoạt tự động điều chỉnh hàng năm theo tình hình thị trường nhằm đảm bảo mục tiêu tích lũy hưu trí, nhưng cam kết không vượt quá giới hạn rủi ro tại biểu đồ này.</p>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════
             TAB 2: Kế hoạch Tài chính
        ════════════════════════════════════════════════ -->
        <div class="hthbc-tab-content" id="hthbc-pane-financial">

            <!-- Input Form -->
            <div class="hthbc-form-card">
                <h3 class="hthbc-form-title">Mô phỏng Tích lũy Hưu trí</h3>
                <p class="hthbc-form-subtitle">Xem lợi ích dự kiến dựa trên phí đóng và thời hạn của bạn</p>

                <div class="hthbc-fin-inputs">
                    <div class="hthbc-field-group">
                        <label class="hthbc-label" for="hthbc-premium-select">Phí đóng hàng năm</label>
                        <select id="hthbc-premium-select" class="hthbc-select">
                            <option value="50000000">50 triệu đồng/năm</option>
                            <option value="100000000">100 triệu đồng/năm</option>
                            <option value="200000000">200 triệu đồng/năm</option>
                            <option value="250000000" selected>250 triệu đồng/năm</option>
                        </select>
                    </div>

                    <div class="hthbc-field-group">
                        <label class="hthbc-label" for="hthbc-payyears-select">Số năm đóng phí</label>
                        <select id="hthbc-payyears-select" class="hthbc-select">
                            <option value="3">3 năm (tối thiểu bắt buộc)</option>
                            <option value="5">5 năm</option>
                            <option value="10" selected>10 năm (khuyến nghị)</option>
                            <option value="15">15 năm</option>
                        </select>
                    </div>
                </div>

                <!-- Summary cards -->
                <div class="hthbc-summary-cards">
                    <div class="hthbc-summary-card hthbc-card-green">
                        <div class="hthbc-summary-label">Tổng phí dự kiến đóng</div>
                        <div class="hthbc-summary-value" id="hthbc-total-premium">2.500.000.000 đ</div>
                    </div>
                    <div class="hthbc-summary-card hthbc-card-amber">
                        <div class="hthbc-summary-label">Năm bắt đầu rút tự do</div>
                        <div class="hthbc-summary-value" id="hthbc-free-withdraw-year">Từ Năm thứ 6</div>
                    </div>
                    <div class="hthbc-summary-card hthbc-card-blue">
                        <div class="hthbc-summary-label">Thưởng Tri Ân dự kiến</div>
                        <div class="hthbc-summary-value" id="hthbc-loyalty-bonus">cuối Năm 20</div>
                    </div>
                </div>
            </div>

            <!-- Milestones -->
            <div class="hthbc-milestones">
                <div class="hthbc-milestone" id="hthbc-ms-3">
                    <div class="hthbc-ms-dot hthbc-ms-done">✓</div>
                    <div class="hthbc-ms-body">
                        <div class="hthbc-ms-year">Năm 3</div>
                        <div class="hthbc-ms-desc">Xong giai đoạn đóng phí bắt buộc</div>
                    </div>
                </div>
                <div class="hthbc-milestone-line"></div>
                <div class="hthbc-milestone" id="hthbc-ms-6">
                    <div class="hthbc-ms-dot hthbc-ms-amber">6</div>
                    <div class="hthbc-ms-body">
                        <div class="hthbc-ms-year">Năm 6</div>
                        <div class="hthbc-ms-desc">Rút tiền tự do — 0% phí chấm dứt</div>
                    </div>
                </div>
                <div class="hthbc-milestone-line"></div>
                <div class="hthbc-milestone" id="hthbc-ms-20">
                    <div class="hthbc-ms-dot hthbc-ms-blue">🎁</div>
                    <div class="hthbc-ms-body">
                        <div class="hthbc-ms-year">Năm 20</div>
                        <div class="hthbc-ms-desc">Nhận Thưởng Tri Ân (~80% phí năm đầu)</div>
                    </div>
                </div>
            </div>

            <!-- Line Chart -->
            <div class="hthbc-chart-section">
                <div class="hthbc-fin-chart-header">
                    <h4 class="hthbc-fin-chart-title">Tăng trưởng Giá trị Tích lũy theo Năm</h4>
                    <div class="hthbc-legend-row">
                        <span class="hthbc-legend-dot" style="background:#00843D"></span>
                        <span class="hthbc-legend-text">Tỷ suất Cao (9%/năm)</span>
                        <span class="hthbc-legend-dot" style="background:#F5A623; margin-left:16px"></span>
                        <span class="hthbc-legend-text">Tỷ suất Thấp (1.3%/năm)</span>
                    </div>
                </div>
                <div class="hthbc-chart-container" style="height:320px">
                    <canvas id="hthbc-fin-canvas" aria-label="Biểu đồ tăng trưởng giá trị tích lũy"></canvas>
                </div>
            </div>

            <!-- Yearly Table -->
            <div class="hthbc-table-section">
                <h4 class="hthbc-table-title">Chi tiết theo từng năm</h4>
                <div class="hthbc-table-wrapper">
                    <table class="hthbc-table" id="hthbc-fin-table">
                        <thead>
                            <tr>
                                <th>Năm HĐ</th>
                                <th>Tổng phí đã đóng</th>
                                <th class="hthbc-th-high">GTTK (Tỷ suất 9%)</th>
                                <th class="hthbc-th-low">GTTK (Tỷ suất 1.3%)</th>
                                <th>Phí chấm dứt</th>
                                <th>Có thể rút (9%)</th>
                            </tr>
                        </thead>
                        <tbody id="hthbc-fin-tbody"></tbody>
                    </table>
                </div>
            </div>

            <div class="hthbc-disclaimer">
                <p>Lưu ý: Các con số trên là minh họa dựa trên tỷ suất đầu tư giả định (9%/năm cao và 1,3%/năm thấp). Kết quả thực tế phụ thuộc vào hiệu quả đầu tư của Quỹ Hưng Thịnh và không được Manulife đảm bảo. Phí quản lý quỹ tối đa 2,5%/năm đã được tính vào mô phỏng. Thông tin chỉ mang tính tham khảo, không phải tư vấn tài chính.</p>
            </div>
        </div>

    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'hung_thinh_bar_chart', 'hthbc_render_shortcode' );
