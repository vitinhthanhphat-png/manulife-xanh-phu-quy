<?php
/**
 * Uninstall — Hung Thinh Bar Chart
 *
 * Runs automatically when admin goes to Plugins → Delete.
 * Removes all plugin options from wp_options to keep the DB clean.
 *
 * NOTE: Avatar & Logo images uploaded to the Media Library
 * are intentionally NOT deleted — they belong to the site owner.
 */

// Safety check: only run via WP uninstall, never directly.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

$options_to_delete = array(
    'hthbc_expert_name',
    'hthbc_expert_title',
    'hthbc_expert_phone',
    'hthbc_expert_email',
    'hthbc_expert_avatar',  // URL reference only — file stays in Media Library
    'hthbc_expert_logo',    // URL reference only — file stays in Media Library
    'hthbc_expert_code',
);

foreach ( $options_to_delete as $option ) {
    delete_option( $option );
}
