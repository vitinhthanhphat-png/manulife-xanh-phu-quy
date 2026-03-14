<?php
/**
 * Plugin Name: Hung Thinh Bar Chart - Xanh Phu Quy
 * Plugin URI:  https://techsharevn.com
 * Description: Biểu đồ cột tương tác + Kế hoạch tài chính của Quỹ Hưng Thịnh (Sản phẩm Xanh Phú Quý - Manulife). Powered by Techshare VN.
 * Version:     2.2.0
 * Author:      Trần Vĩ Thành — Techshare VN
 * Author URI:  https://techsharevn.com
 * License:     GPL-2.0-or-later
 * Text Domain: hung-thinh-bar-chart
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'HTHBC_VERSION',    '2.2.0' );
define( 'HTHBC_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'HTHBC_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/* ═══════════════════════════════════════════════════════
   FRONTEND ASSETS
═══════════════════════════════════════════════════════ */
function hthbc_enqueue_assets() {
    wp_enqueue_script( 'chart-js',
        'https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js',
        array(), '4.4.3', true );
    wp_enqueue_script( 'chartjs-plugin-datalabels',
        'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/dist/chartjs-plugin-datalabels.min.js',
        array( 'chart-js' ), '2.2.0', true );
    wp_enqueue_style( 'hung-thinh-chart-css',
        HTHBC_PLUGIN_URL . 'assets/css/hung-thinh-chart.css',
        array(), HTHBC_VERSION );
    wp_enqueue_script( 'hung-thinh-chart-js',
        HTHBC_PLUGIN_URL . 'assets/js/hung-thinh-chart.js',
        array( 'chart-js', 'chartjs-plugin-datalabels' ), HTHBC_VERSION, true );

    $funds_data = array();
    $funds_path = HTHBC_PLUGIN_DIR . 'data/funds.json';
    if ( file_exists( $funds_path ) ) {
        $funds_data = json_decode( file_get_contents( $funds_path ), true );
    }

    wp_localize_script( 'hung-thinh-chart-js', 'hthbcData', array(
        'funds'       => $funds_data,
        'currentYear' => (int) date( 'Y' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'hthbc_enqueue_assets' );

/* ═══════════════════════════════════════════════════════
   ADMIN — MENU REGISTRATION
═══════════════════════════════════════════════════════ */
add_action( 'admin_menu', 'hthbc_admin_menu' );
function hthbc_admin_menu() {
    add_options_page(
        'Hung Thinh Chart — Cài đặt',
        'Hung Thinh Chart',
        'manage_options',
        'hung-thinh-chart',
        'hthbc_settings_page'
    );
}


/* ═══════════════════════════════════════════════════════
   ADMIN — REGISTER SETTINGS
═══════════════════════════════════════════════════════ */
add_action( 'admin_init', 'hthbc_register_settings' );
function hthbc_register_settings() {
    $text_fields = array(
        'hthbc_expert_name',
        'hthbc_expert_title',
        'hthbc_expert_phone',
        'hthbc_expert_email',
        'hthbc_expert_code',
    );
    foreach ( $text_fields as $field ) {
        register_setting( 'hthbc_options_group', $field, array(
            'sanitize_callback' => 'sanitize_text_field',
        ) );
    }
    // URL fields — avatar + logo
    foreach ( array( 'hthbc_expert_avatar', 'hthbc_expert_logo' ) as $url_field ) {
        register_setting( 'hthbc_options_group', $url_field, array(
            'sanitize_callback' => 'esc_url_raw',
        ) );
    }
}

/* ═══════════════════════════════════════════════════════
   ADMIN — ENQUEUE MEDIA UPLOADER (only on settings page)
═══════════════════════════════════════════════════════ */
add_action( 'admin_enqueue_scripts', 'hthbc_admin_assets' );
function hthbc_admin_assets( $hook ) {
    if ( $hook !== 'settings_page_hung-thinh-chart' ) return;
    wp_enqueue_media();
    // Frontend CSS — needed so admin preview banner looks the same as frontend
    wp_enqueue_style( 'hthbc-chart-css',
        HTHBC_PLUGIN_URL . 'assets/css/hung-thinh-chart.css',
        array(), HTHBC_VERSION );
    wp_enqueue_style( 'hthbc-admin-css',
        HTHBC_PLUGIN_URL . 'assets/css/admin.css',
        array( 'hthbc-chart-css' ), HTHBC_VERSION );
    wp_enqueue_script( 'hthbc-admin-js',
        HTHBC_PLUGIN_URL . 'assets/js/admin.js',
        array( 'jquery' ), HTHBC_VERSION, true );
}

/* ═══════════════════════════════════════════════════════
   ADMIN — SETTINGS PAGE (render)
═══════════════════════════════════════════════════════ */
function hthbc_settings_page() {
    $active_tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'expert';
    $page_url   = admin_url( 'options-general.php?page=hung-thinh-chart' );
    ?>
    <div class="wrap hthbc-admin-wrap">
        <div class="hthbc-admin-header">
            <img src="<?php echo HTHBC_PLUGIN_URL; ?>assets/img/manulife-logo.png"
                 alt="Manulife" class="hthbc-admin-logo" onerror="this.style.display='none'">
            <div>
                <h1>Hung Thinh Chart — Xanh Phú Quý</h1>
                <p class="hthbc-admin-sub">Cài đặt plugin biểu đồ tương tác Quỹ Hưng Thịnh</p>
            </div>
        </div>

        <!-- Tab nav -->
        <nav class="nav-tab-wrapper hthbc-nav-tabs">
            <a href="<?php echo $page_url; ?>&tab=expert"
               class="nav-tab <?php echo $active_tab === 'expert' ? 'nav-tab-active' : ''; ?>">
                👤 Chuyên Gia Tài Chính
            </a>
            <a href="<?php echo $page_url; ?>&tab=about"
               class="nav-tab <?php echo $active_tab === 'about' ? 'nav-tab-active' : ''; ?>">
                ℹ️ Thông tin Tác Giả
            </a>
        </nav>

        <?php if ( $active_tab === 'expert' ) : ?>
        <!-- ── TAB 1: Expert Settings ─────────────────── -->
        <div class="hthbc-admin-panel">
            <form method="post" action="options.php">
                <?php settings_fields( 'hthbc_options_group' ); ?>

                <table class="form-table">
                    <!-- Logo -->
                    <tr>
                        <th scope="row"><label>Logo (hiển thị trên banner)</label></th>
                        <td>
                            <?php $logo = get_option( 'hthbc_expert_logo', '' ); ?>
                            <div class="hthbc-logo-preview">
                                <?php if ( $logo ) : ?>
                                    <img src="<?php echo esc_url( $logo ); ?>" id="hthbc-logo-preview-img" style="max-height:50px;max-width:160px;object-fit:contain;">
                                <?php else : ?>
                                    <span id="hthbc-logo-preview-img" style="color:#aaa;font-size:12px;">Chưa có logo</span>
                                <?php endif; ?>
                            </div>
                            <input type="hidden" id="hthbc_expert_logo" name="hthbc_expert_logo"
                                   value="<?php echo esc_url( $logo ); ?>">
                            <button type="button" class="button" id="hthbc-upload-logo" style="margin-top:8px;">
                                🖼️ Upload Logo
                            </button>
                            <?php if ( $logo ) : ?>
                                <button type="button" class="button hthbc-remove-logo">✕ Xóa Logo</button>
                            <?php endif; ?>
                            <p class="description">Khuyến nghị: PNG nền trong, chiều cao tối đa 60px. VD: logo Manulife, logo đại lý.</p>
                        </td>
                    </tr>

                    <!-- Avatar -->
                    <tr>
                        <th scope="row"><label>Ảnh đại diện</label></th>
                        <td>
                            <?php $avatar = get_option( 'hthbc_expert_avatar', '' ); ?>
                            <div class="hthbc-avatar-preview">
                                <?php if ( $avatar ) : ?>
                                    <img src="<?php echo esc_url( $avatar ); ?>" id="hthbc-avatar-preview-img">
                                <?php else : ?>
                                    <img src="<?php echo HTHBC_PLUGIN_URL; ?>assets/img/avatar-placeholder.png"
                                         id="hthbc-avatar-preview-img" style="opacity:.4">
                                <?php endif; ?>
                            </div>
                            <input type="hidden" id="hthbc_expert_avatar" name="hthbc_expert_avatar"
                                   value="<?php echo esc_url( $avatar ); ?>">
                            <button type="button" class="button" id="hthbc-upload-avatar">
                                📷 Chọn ảnh
                            </button>
                            <?php if ( $avatar ) : ?>
                                <button type="button" class="button hthbc-remove-avatar">✕ Xóa ảnh</button>
                            <?php endif; ?>
                            <p class="description">Tỷ lệ khuyến nghị: 1:1 (hình vuông), tối thiểu 200×200px</p>
                        </td>
                    </tr>

                    <!-- Name -->
                    <tr>
                        <th scope="row"><label for="hthbc_expert_name">Họ và tên</label></th>
                        <td>
                            <input type="text" id="hthbc_expert_name" name="hthbc_expert_name"
                                   class="regular-text"
                                   value="<?php echo esc_attr( get_option( 'hthbc_expert_name', HTHBC_DEFAULT_NAME ) ); ?>">
                        </td>
                    </tr>

                    <!-- Title -->
                    <tr>
                        <th scope="row"><label for="hthbc_expert_title">Chức vụ</label></th>
                        <td>
                            <input type="text" id="hthbc_expert_title" name="hthbc_expert_title"
                                   class="regular-text"
                                   value="<?php echo esc_attr( get_option( 'hthbc_expert_title', HTHBC_DEFAULT_TITLE ) ); ?>">
                        </td>
                    </tr>

                    <!-- Phone -->
                    <tr>
                        <th scope="row"><label for="hthbc_expert_phone">Số điện thoại</label></th>
                        <td>
                            <input type="text" id="hthbc_expert_phone" name="hthbc_expert_phone"
                                   class="regular-text"
                                   value="<?php echo esc_attr( get_option( 'hthbc_expert_phone', HTHBC_DEFAULT_PHONE ) ); ?>">
                        </td>
                    </tr>

                    <!-- Email -->
                    <tr>
                        <th scope="row"><label for="hthbc_expert_email">Email</label></th>
                        <td>
                            <input type="email" id="hthbc_expert_email" name="hthbc_expert_email"
                                   class="regular-text"
                                   value="<?php echo esc_attr( get_option( 'hthbc_expert_email', HTHBC_DEFAULT_EMAIL ) ); ?>">
                        </td>
                    </tr>

                    <!-- Agent Code -->
                    <tr>
                        <th scope="row"><label for="hthbc_expert_code">Mã Đại Lý</label></th>
                        <td>
                            <input type="text" id="hthbc_expert_code" name="hthbc_expert_code"
                                   class="small-text"
                                   value="<?php echo esc_attr( get_option( 'hthbc_expert_code', HTHBC_DEFAULT_CODE ) ); ?>"
                                   style="width:120px;font-size:14px;font-weight:700;letter-spacing:1px;">
                            <p class="description">Hiển thị dưới chức vụ trên banner chân trang.</p>
                        </td>
                    </tr>

                <div class="hthbc-admin-preview-title">Xem trước — Banner Chuyên Gia</div>
                <?php echo hthbc_render_expert_banner( true ); ?>

                <?php submit_button( 'Lưu cài đặt', 'primary large', 'submit', true, array( 'id' => 'hthbc-save-btn' ) ); ?>
            </form>
        </div>

        <?php else : ?>
        <!-- ── TAB 2: About Author ────────────────────── -->
        <div class="hthbc-admin-panel hthbc-about-panel">
            <div class="hthbc-about-card">
                <div class="hthbc-about-logo-wrap">
                    <div class="hthbc-about-logo-circle">TS</div>
                </div>
                <div class="hthbc-about-info">
                    <h2>Techshare VN</h2>
                    <p class="hthbc-about-tagline">Giải pháp Web & Plugin WordPress chuyên nghiệp</p>
                    <table class="hthbc-about-table">
                        <tr>
                            <td>🌐 Website</td>
                            <td><a href="https://techsharevn.com" target="_blank">techsharevn.com</a></td>
                        </tr>
                        <tr>
                            <td>👤 Tác giả</td>
                            <td><strong>Trần Vĩ Thành</strong></td>
                        </tr>
                        <tr>
                            <td>📞 Điện thoại</td>
                            <td><a href="tel:0949897293">0949 897 293</a></td>
                        </tr>
                        <tr>
                            <td>✉️ Email</td>
                            <td><a href="mailto:thanh.web1001@gmail.com">thanh.web1001@gmail.com</a></td>
                        </tr>
                        <tr>
                            <td>📦 Plugin</td>
                            <td>Hung Thinh Bar Chart v<?php echo HTHBC_VERSION; ?></td>
                        </tr>
                        <tr>
                            <td>📅 Build</td>
                            <td>2026 — GPL-2.0-or-later</td>
                        </tr>
                    </table>
                </div>
            </div>

            <div class="hthbc-shortcode-box">
                <h3>Shortcode</h3>
                <code>[hung_thinh_bar_chart]</code>
                <p>Dán shortcode vào bất kỳ Page hoặc Post nào để hiển thị plugin.</p>
            </div>
        </div>
        <?php endif; ?>
    </div>
    <?php
}

/* ═══════════════════════════════════════════════════════
   HELPER — RENDER EXPERT BANNER (reused in frontend + admin preview)
═══════════════════════════════════════════════════════ */
// Default expert info — shown on fresh installs before admin customizes
define( 'HTHBC_DEFAULT_NAME',   'Dương Thị Kim Ánh' );
define( 'HTHBC_DEFAULT_TITLE',  'Chuyên Gia Tư Vấn Tài Chính Cao Cấp' );
define( 'HTHBC_DEFAULT_PHONE',  '0945 88 00 53' );
define( 'HTHBC_DEFAULT_EMAIL',  'anh_hz547@manulife.com.vn' );
define( 'HTHBC_DEFAULT_CODE',   'HZ547' );

function hthbc_render_expert_banner( $is_preview = false ) {
    $name   = get_option( 'hthbc_expert_name',   HTHBC_DEFAULT_NAME );
    $title  = get_option( 'hthbc_expert_title',  HTHBC_DEFAULT_TITLE );
    $phone  = get_option( 'hthbc_expert_phone',  HTHBC_DEFAULT_PHONE );
    $email  = get_option( 'hthbc_expert_email',  HTHBC_DEFAULT_EMAIL );
    $avatar = get_option( 'hthbc_expert_avatar', '' );
    $logo   = get_option( 'hthbc_expert_logo',   '' );
    $code   = get_option( 'hthbc_expert_code',   HTHBC_DEFAULT_CODE );

    // If all empty AND not a preview, skip rendering
    if ( ! $is_preview && ! $name && ! $phone ) return '';

    $preview_class = $is_preview ? ' hthbc-expert-preview' : '';

    ob_start();
    ?>
    <div class="hthbc-expert-banner<?php echo $preview_class; ?>">

        <!-- Logo (uploaded by admin) -->
        <?php if ( $logo ) : ?>
        <div class="hthbc-expert-ml-logo">
            <img src="<?php echo esc_url( $logo ); ?>" alt="Logo" class="hthbc-expert-logo-img">
        </div>
        <?php endif; ?>

        <!-- Avatar -->
        <div class="hthbc-expert-avatar-wrap">
            <?php if ( $avatar ) : ?>
                <img src="<?php echo esc_url( $avatar ); ?>" alt="<?php echo esc_attr( $name ); ?>" class="hthbc-expert-avatar-img">
            <?php else : ?>
                <div class="hthbc-expert-avatar-placeholder">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                </div>
            <?php endif; ?>
        </div>

        <!-- Info -->
        <div class="hthbc-expert-details">
            <?php if ( $name ) : ?>
                <div class="hthbc-expert-name"><?php echo esc_html( $name ); ?></div>
            <?php else : ?>
                <div class="hthbc-expert-name hthbc-expert-placeholder">Chuyên Gia Tài Chính</div>
            <?php endif; ?>
            <?php if ( $title ) : ?>
                <div class="hthbc-expert-pos">
                    <?php echo esc_html( $title ); ?>
                    <?php if ( $code ) : ?>
                        <span class="hthbc-expert-code"> | Mã ĐL: <?php echo esc_html( $code ); ?></span>
                    <?php endif; ?>
                </div>
            <?php elseif ( $code ) : ?>
                <div class="hthbc-expert-pos"><span class="hthbc-expert-code">Mã ĐL: <?php echo esc_html( $code ); ?></span></div>
            <?php endif; ?>
            <div class="hthbc-expert-contacts">
                <?php if ( $phone ) : ?>
                    <a href="tel:<?php echo esc_attr( preg_replace( '/\s+/', '', $phone ) ); ?>" class="hthbc-expert-link hthbc-link-phone">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1l-1.3 1.3a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.9.6 2.8.7A2 2 0 0122 16.9z"/></svg>
                        <?php echo esc_html( $phone ); ?>
                    </a>
                <?php endif; ?>
                <?php if ( $email ) : ?>
                    <a href="mailto:<?php echo esc_attr( $email ); ?>" class="hthbc-expert-link hthbc-link-email">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 4l10 9 10-9"/></svg>
                        <?php echo esc_html( $email ); ?>
                    </a>
                <?php endif; ?>
            </div>
        </div>

        <!-- CTA button -->
        <?php if ( $phone ) : ?>
            <a href="tel:<?php echo esc_attr( preg_replace( '/\s+/', '', $phone ) ); ?>"
               class="hthbc-expert-cta">
                📞 Liên hệ ngay
            </a>
        <?php else : ?>
            <div class="hthbc-expert-cta hthbc-cta-disabled">📞 Liên hệ ngay</div>
        <?php endif; ?>

    </div>
    <?php
    return ob_get_clean();
}

/* ═══════════════════════════════════════════════════════
   SHORTCODE: [hung_thinh_bar_chart]
═══════════════════════════════════════════════════════ */
function hthbc_render_shortcode( $atts ) {
    ob_start();
    ?>
    <div class="hthbc-wrapper" id="hung-thinh-bar-chart">

        <!-- Expert Banner (always visible above tabs) -->
        <?php echo hthbc_render_expert_banner(); ?>

        <!-- Tab Navigation -->
        <div class="hthbc-tabs">
            <button class="hthbc-tab-btn active" data-tab="allocation">
                <span class="hthbc-tab-icon">📊</span>
                <span>Phân bổ Tài sản</span>
            </button>
            <button class="hthbc-tab-btn" data-tab="financial">
                <span class="hthbc-tab-icon">💰</span>
                <span>Kế hoạch Tài chính</span>
            </button>
        </div>

        <!-- TAB 1: Allocation Bar Chart -->
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
                            min="18" max="65" value="30" step="1">
                        <input type="number" id="hthbc-age-number" class="hthbc-number-input"
                            min="18" max="65" value="30">
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
                    min="2026" max="2045" value="2026" step="1">
                <div class="hthbc-time-info">
                    <span class="hthbc-time-badge" id="hthbc-time-badge">📅 Năm 2026</span>
                    <span class="hthbc-age-info" id="hthbc-age-info">Lúc bạn <strong>30</strong> tuổi</span>
                </div>
            </div>

            <div class="hthbc-chart-section">
                <div class="hthbc-chart-container">
                    <canvas id="hthbc-canvas"></canvas>
                </div>
                <p class="hthbc-narrative" id="hthbc-narrative"></p>
            </div>

            <div class="hthbc-disclaimer">
                <p>Lưu ý: Biểu đồ cột minh họa dựa trên giới hạn tỷ lệ phân bổ tài sản đầu tư tối đa của Quỹ Hưng Thịnh. Tỷ trọng đầu tư thực tế sẽ được chuyên gia Manulife linh hoạt tự động điều chỉnh hàng năm theo tình hình thị trường nhằm đảm bảo mục tiêu tích lũy hưu trí, nhưng cam kết không vượt quá giới hạn rủi ro tại biểu đồ này.</p>
            </div>
        </div>

        <!-- TAB 2: Financial Planner -->
        <div class="hthbc-tab-content" id="hthbc-pane-financial">
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
                <div class="hthbc-summary-cards">
                    <div class="hthbc-summary-card hthbc-card-green">
                        <div class="hthbc-summary-label">Tổng phí dự kiến đóng</div>
                        <div class="hthbc-summary-value" id="hthbc-total-premium">2.5 tỷđ</div>
                    </div>
                    <div class="hthbc-summary-card hthbc-card-amber">
                        <div class="hthbc-summary-label">Năm bắt đầu rút tự do</div>
                        <div class="hthbc-summary-value" id="hthbc-free-withdraw-year">Từ Năm thứ 6</div>
                    </div>
                    <div class="hthbc-summary-card hthbc-card-blue">
                        <div class="hthbc-summary-label">Thưởng Tri Ân dự kiến</div>
                        <div class="hthbc-summary-value" id="hthbc-loyalty-bonus">Cuối Năm 20</div>
                    </div>
                </div>
            </div>

            <div class="hthbc-milestones">
                <div class="hthbc-milestone">
                    <div class="hthbc-ms-dot hthbc-ms-done">✓</div>
                    <div class="hthbc-ms-body">
                        <div class="hthbc-ms-year">Năm 3</div>
                        <div class="hthbc-ms-desc">Xong giai đoạn đóng phí bắt buộc</div>
                    </div>
                </div>
                <div class="hthbc-milestone-line"></div>
                <div class="hthbc-milestone">
                    <div class="hthbc-ms-dot hthbc-ms-amber">6</div>
                    <div class="hthbc-ms-body">
                        <div class="hthbc-ms-year">Năm 6</div>
                        <div class="hthbc-ms-desc">Rút tiền tự do — 0% phí chấm dứt</div>
                    </div>
                </div>
                <div class="hthbc-milestone-line"></div>
                <div class="hthbc-milestone">
                    <div class="hthbc-ms-dot hthbc-ms-blue">🎁</div>
                    <div class="hthbc-ms-body">
                        <div class="hthbc-ms-year">Năm 20</div>
                        <div class="hthbc-ms-desc">Nhận Thưởng Tri Ân (~80% phí năm đầu)</div>
                    </div>
                </div>
            </div>

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
                    <canvas id="hthbc-fin-canvas"></canvas>
                </div>
            </div>

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
                <p>Lưu ý: Các con số trên là minh họa dựa trên tỷ suất đầu tư giả định (9%/năm cao và 1,3%/năm thấp). Kết quả thực tế phụ thuộc vào hiệu quả đầu tư của Quỹ Hưng Thịnh và không được Manulife đảm bảo. Phí quản lý quỹ tối đa 2,5%/năm đã được tính vào mô phỏng.</p>
            </div>
        </div>

    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'hung_thinh_bar_chart', 'hthbc_render_shortcode' );
