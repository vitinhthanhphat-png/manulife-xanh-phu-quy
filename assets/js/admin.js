/**
 * Admin JS — Hung Thinh Chart
 * Handles WP Media Uploader for avatar and logo fields
 */
(function ($) {
    'use strict';

    // ── Reposition WP settings notice below the green header ──
    $(function () {
        var $nav = $('.hthbc-admin-wrap .hthbc-nav-tabs');
        // Find any WP settings notices anywhere on the page (inside or outside header)
        var $notices = $('[id^="setting-error-"], .settings-error, .notice-success.is-dismissible')
            .not('.hthbc-expert-banner *');
        if ($notices.length && $nav.length) {
            $notices.detach().insertBefore($nav).css({ 'margin': '12px 0' });
        }
    });

    // Generic media uploader factory
    function makeUploader(opts) {
        var mediaUploader;
        $(opts.triggerBtn).on('click', function (e) {
            e.preventDefault();
            if (mediaUploader) { mediaUploader.open(); return; }
            mediaUploader = wp.media({
                title:    opts.title,
                button:   { text: 'Sử dụng ảnh này' },
                multiple: false,
                library:  { type: 'image' }
            });
            mediaUploader.on('select', function () {
                var attachment = mediaUploader.state().get('selection').first().toJSON();
                $(opts.hiddenInput).val(attachment.url);
                opts.onSelect(attachment.url);
                if ($(opts.removeBtn).length === 0) {
                    $(opts.triggerBtn).after(
                        $('<button>').attr({ type: 'button', class: 'button ' + opts.removeBtnClass }).text('✕ ' + opts.removeLabel)
                    );
                    bindRemove(opts.removeBtnClass, opts.hiddenInput, opts.onRemove);
                }
            });
            mediaUploader.open();
        });
    }

    function bindRemove(cls, hiddenInput, onRemove) {
        $(document).on('click', '.' + cls, function (e) {
            e.preventDefault();
            $(hiddenInput).val('');
            if (onRemove) onRemove();
            $(this).remove();
        });
    }

    // ── Avatar ─────────────────────────────────────────────
    makeUploader({
        triggerBtn:     '#hthbc-upload-avatar',
        hiddenInput:    '#hthbc_expert_avatar',
        title:          'Chọn ảnh đại diện Chuyên Gia',
        removeBtnClass: 'hthbc-remove-avatar',
        removeLabel:    'Xóa ảnh',
        onSelect: function (url) {
            $('#hthbc-avatar-preview-img').attr('src', url).css('opacity', 1);
        },
        onRemove: function () {
            $('#hthbc-avatar-preview-img').attr('src', '').css('opacity', 0.4);
        }
    });
    bindRemove('hthbc-remove-avatar', '#hthbc_expert_avatar', function () {
        $('#hthbc-avatar-preview-img').attr('src', '').css('opacity', 0.4);
    });

    // ── Logo ───────────────────────────────────────────────
    makeUploader({
        triggerBtn:     '#hthbc-upload-logo',
        hiddenInput:    '#hthbc_expert_logo',
        title:          'Chọn Logo (Manulife, Đại lý...)',
        removeBtnClass: 'hthbc-remove-logo',
        removeLabel:    'Xóa Logo',
        onSelect: function (url) {
            var $el = $('#hthbc-logo-preview-img');
            if ($el.is('img')) {
                $el.attr('src', url);
            } else {
                // Replace the <span> placeholder with an <img>
                $el.replaceWith($('<img>').attr({ id: 'hthbc-logo-preview-img', src: url }).css({ maxHeight: '50px', maxWidth: '160px', objectFit: 'contain' }));
            }
        },
        onRemove: function () {
            $('#hthbc-logo-preview-img').replaceWith(
                $('<span>').attr({ id: 'hthbc-logo-preview-img' }).text('Chưa có logo').css({ color: '#aaa', fontSize: '12px' })
            );
        }
    });
    bindRemove('hthbc-remove-logo', '#hthbc_expert_logo', function () {
        $('#hthbc-logo-preview-img').replaceWith(
            $('<span>').attr({ id: 'hthbc-logo-preview-img' }).text('Chưa có logo').css({ color: '#aaa', fontSize: '12px' })
        );
    });

}(jQuery));

