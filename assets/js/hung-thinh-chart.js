/**
 * Hung Thinh Bar Chart v2.5.0 — Manulife Xanh Phu Quy
 * Tab 1: Allocation Bar Chart
 * Tab 2: Financial Projection Engine
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        if (!document.getElementById('hung-thinh-bar-chart')) return;
        TabController.init();
        AllocationChart.init();
        FinancialPlanner.init();
        HistoryChart.init();
    });

    /* ═══════════════════════════════════════════════════
       TAB CONTROLLER
    ═══════════════════════════════════════════════════ */
    var TabController = {
        init: function () {
            var btns = document.querySelectorAll('.hthbc-tab-btn');
            btns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var target = this.dataset.tab;
                    TabController.switchTo(target);
                });
            });
        },
        switchTo: function (tab) {
            document.querySelectorAll('.hthbc-tab-btn').forEach(function (b) {
                b.classList.toggle('active', b.dataset.tab === tab);
            });
            document.querySelectorAll('.hthbc-tab-content').forEach(function (p) {
                p.classList.toggle('active', p.id === 'hthbc-pane-' + tab);
            });
        }
    };

    /* ═══════════════════════════════════════════════════
       TAB 1: ALLOCATION BAR CHART
    ═══════════════════════════════════════════════════ */
    var AllocationChart = {
        CURRENT_YEAR: (window.hthbcData && hthbcData.currentYear) ? hthbcData.currentYear : new Date().getFullYear(),
        FUNDS:        (window.hthbcData && hthbcData.funds)       ? hthbcData.funds       : {},
        chart:      null,
        currentAge:  30,
        currentFund: '2045',
        currentYear: 2026,

        COLORS: {
            stocks: { bar: '#00843D', hover: '#005c2b' },
            bonds:  { bar: '#F5A623', hover: '#c07d10' },
            money:  { bar: '#9B9B9B', hover: '#6b6b6b' }
        },

        // Fund → recommended pay-years hint for Tab 2
        FUND_HINT: {
            '2035': { years: 5,  label: 'Quỹ 2035 — khuyến nghị đóng 5 năm' },
            '2040': { years: 10, label: 'Quỹ 2040 — khuyến nghị đóng 10 năm' },
            '2045': { years: 15, label: 'Quỹ 2045 — khuyến nghị đóng 15 năm' },
        },

        init: function () {
            this.currentYear = this.CURRENT_YEAR;
            this.bindElements();
            this.bindEvents();
            this.updateTimeSliderRange();
            this.initChart();
            this.update();
        },

        bindElements: function () {
            this.el = {
                ageSlider:  document.getElementById('hthbc-age-slider'),
                ageNumber:  document.getElementById('hthbc-age-number'),
                ageDisplay: document.getElementById('hthbc-age-display'),
                fundSelect: document.getElementById('hthbc-fund-select'),
                timeSlider: document.getElementById('hthbc-time-slider'),
                yearStart:  document.getElementById('hthbc-year-start'),
                yearEnd:    document.getElementById('hthbc-year-end'),
                timeBadge:  document.getElementById('hthbc-time-badge'),
                ageInfo:    document.getElementById('hthbc-age-info'),
                narrative:  document.getElementById('hthbc-narrative'),
                canvas:     document.getElementById('hthbc-canvas'),
            };
        },

        bindEvents: function () {
            var self = this;
            self.el.ageSlider.addEventListener('input', function () {
                var val = parseInt(this.value, 10);
                self.currentAge = val;
                self.el.ageNumber.value = val;
                self.el.ageDisplay.textContent = val;
                self.updateAgeSliderTrack();
                self.update();
            });
            self.el.ageNumber.addEventListener('input', function () {
                var val = Math.min(65, Math.max(18, parseInt(this.value, 10) || 18));
                self.currentAge = val;
                self.el.ageSlider.value = val;
                self.el.ageDisplay.textContent = val;
                self.updateAgeSliderTrack();
                self.update();
            });
            self.el.fundSelect.addEventListener('change', function () {
                self.currentFund = this.value;
                self.updateTimeSliderRange();
                self.update();
            });
            self.el.timeSlider.addEventListener('input', function () {
                self.currentYear = parseInt(this.value, 10);
                self.update();
            });
            // Tab cross-link: click callout link → switch to Tab 1
            var rcLink = document.getElementById('hthbc-goto-tab1');
            if (rcLink) {
                rcLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    TabController.switchTo('allocation');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }
        },

        updateTimeSliderRange: function () {
            var fundYear = parseInt(this.currentFund, 10);
            this.el.timeSlider.min   = this.CURRENT_YEAR;
            this.el.timeSlider.max   = fundYear;
            this.el.timeSlider.value = this.CURRENT_YEAR;
            this.currentYear         = this.CURRENT_YEAR;
            this.el.yearStart.textContent = this.CURRENT_YEAR;
            this.el.yearEnd.textContent   = fundYear;
        },

        getAllocation: function (fund, year) {
            var fundData = this.FUNDS[fund];
            if (!fundData) return { s: 0, b: 0, m: 0 };
            if (fundData[year]) return fundData[year];
            var years = Object.keys(fundData).map(Number).sort(function (a, b) { return a - b; });
            var chosen = years[0];
            for (var i = 0; i < years.length; i++) {
                if (years[i] <= year) chosen = years[i]; else break;
            }
            return fundData[chosen] || { s: 0, b: 0, m: 0 };
        },

        updateAgeSliderTrack: function () {
            var pct = ((this.currentAge - 18) / (65 - 18)) * 100;
            this.el.ageSlider.style.setProperty('--slider-pct', pct + '%');
        },

        initChart: function () {
            var self = this;
            Chart.register(ChartDataLabels);
            var ctx = self.el.canvas.getContext('2d');
            self.chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['🟢 Cổ phiếu', '🟠 Trái phiếu / CCLS', '⚫ Thị trường tiền tệ'],
                    datasets: [{
                        label: 'Tỷ lệ đầu tư tối đa (%)',
                        data:  [85, 40, 10],
                        backgroundColor: [self.COLORS.stocks.bar, self.COLORS.bonds.bar, self.COLORS.money.bar],
                        hoverBackgroundColor: [self.COLORS.stocks.hover, self.COLORS.bonds.hover, self.COLORS.money.hover],
                        borderRadius: 8,
                        borderSkipped: false,
                        barPercentage: 0.55,
                        categoryPercentage: 0.7,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 300, easing: 'easeInOutQuart' },
                    scales: {
                        y: {
                            min: 0, max: 100,
                            ticks: {
                                stepSize: 20,
                                callback: function (v) { return v + '%'; },
                                color: '#6b7280',
                                font: { size: 12, family: "'Inter',sans-serif" }
                            },
                            grid: { color: 'rgba(0,0,0,0.07)' },
                            border: { display: false }
                        },
                        x: {
                            ticks: { color: '#374151', font: { size: 13, weight: '600', family: "'Inter',sans-serif" } },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: { label: function (ctx) { return ' ' + ctx.parsed.y + '%'; } },
                            backgroundColor: 'rgba(0,0,0,0.75)',
                            padding: 10, cornerRadius: 8
                        },
                        datalabels: {
                            anchor: 'end', align: 'end', offset: 4,
                            color: function (ctx) {
                                return ['#00843D','#c07d10','#6b6b6b'][ctx.dataIndex] || '#333';
                            },
                            font: { size: 15, weight: '700', family: "'Inter',sans-serif" },
                            formatter: function (v) { return v + '%'; }
                        }
                    }
                }
            });
        },

        update: function () {
            var alloc = this.getAllocation(this.currentFund, this.currentYear);
            var displayAge = this.currentAge + (this.currentYear - this.CURRENT_YEAR);
            this.chart.data.datasets[0].data = [alloc.s, alloc.b, alloc.m];
            this.chart.update();
            this.el.timeBadge.textContent = '📅 Năm ' + this.currentYear;
            this.el.ageInfo.innerHTML     = 'Lúc bạn <strong>' + displayAge + '</strong> tuổi';
            this.el.ageDisplay.textContent = this.currentAge;
            var baseStocks = this.getAllocation(this.currentFund, this.CURRENT_YEAR).s;
            var trend = alloc.s < baseStocks ? 'giảm xuống' : 'ở mức';
            var narrative = this.currentYear === this.CURRENT_YEAR
                ? '📊 Hiện tại (năm ' + this.currentYear + '), lúc bạn ' + displayAge + ' tuổi, trần rủi ro cổ phiếu đang ở mức <strong>' + alloc.s + '%</strong> — phù hợp cho tích lũy dài hạn.'
                : '📊 Năm ' + this.currentYear + ', lúc bạn ' + displayAge + ' tuổi, trần rủi ro cổ phiếu ' + trend + ' còn <strong>' + alloc.s + '%</strong>, tỷ lệ trái phiếu/CCLS tăng lên <strong>' + alloc.b + '%</strong> — ưu tiên sự an toàn và bảo toàn vốn.';
            this.el.narrative.innerHTML = narrative;
            this.updateFundHint();
        },

        updateFundHint: function () {
            var hint = this.FUND_HINT[this.currentFund];
            var el   = document.getElementById('hthbc-fund-hint');
            if (el && hint) {
                el.textContent = hint.label;
            }
        }
    };

    /* ═══════════════════════════════════════════════════
       TAB 2: FINANCIAL PLANNER
    ═══════════════════════════════════════════════════ */
    var FinancialPlanner = {

        /* --- Constants from Manulife PDF --- */
        // Initial allocation fees deducted (reduce invested amount)
        INITIAL_CHARGE_RATES: [0.30, 0.20, 0.10, 0.10, 0.10], // Years 1–5

        // Surrender charges (phí chấm dứt hợp đồng)
        SURRENDER_CHARGES: { 1: 0.75, 2: 0.75, 3: 0.50, 4: 0.20, 5: 0.10 }, // Year 6+: 0

        FUND_MGMT_FEE: 0.025,    // 2.5%/year max
        POLICY_MGMT_FEE: 564000, // ~47,000đ/month * 12 in VND

        HIGH_RATE: 0.09,  // 9%/year
        LOW_RATE:  0.013, // 1.3%/year

        PROJECTION_YEARS: 25,

        // Guaranteed interest rates for Loyalty Bonus (Thuong Tri An) by payment years
        // Source: Manulife Xanh Phu Quy Terms & Conditions
        LOYALTY_RATES: { 3: 0.025, 4: 0.025, 5: 0.025, 6: 0.030, 7: 0.035, 8: 0.040, 9: 0.045, 10: 0.050, 15: 0.050 },

        // State
        premium:       250000000,
        payYears:      10,
        withdrawalMode: false,
        finChartHigh:  null,
        finChartLow:   null,
        lineChart:     null,

        init: function () {
            this.bindElements();
            this.bindEvents();
            this.updateAll();
        },

        bindElements: function () {
            this.el = {
                premiumSelect:    document.getElementById('hthbc-premium-select'),
                payYearsSelect:   document.getElementById('hthbc-payyears-select'),
                totalPremium:     document.getElementById('hthbc-total-premium'),
                freeWithdrawYear: document.getElementById('hthbc-free-withdraw-year'),
                loyaltyBonus:     document.getElementById('hthbc-loyalty-bonus'),
                finCanvas:        document.getElementById('hthbc-fin-canvas'),
                finTbody:         document.getElementById('hthbc-fin-tbody'),
                withdrawToggle:   document.getElementById('hthbc-withdrawal-toggle'),
                withdrawInfo:     document.getElementById('hthbc-withdrawal-info'),
                annualWithdrawal: document.getElementById('hthbc-annual-withdrawal'),
            };
        },

        bindEvents: function () {
            var self = this;
            self.el.premiumSelect.addEventListener('change', function () {
                self.premium = parseInt(this.value, 10);
                self.updateAll();
            });
            self.el.payYearsSelect.addEventListener('change', function () {
                self.payYears = parseInt(this.value, 10);
                self.updateAll();
            });
            if (self.el.withdrawToggle) {
                self.el.withdrawToggle.addEventListener('change', function () {
                    self.withdrawalMode = this.checked;
                    self.updateAll();
                });
            }
            // Smart Banner modal bindings
            self.bindSmartBannerModals();
        },

        /* ── Core financial projection engine ─────────── */
        /**
         * Projects account value at end of given year.
         * @param {number} premium     Annual premium in VND
         * @param {number} payYears    Years customer pays premium
         * @param {number} rate        Annual investment rate (0.09 or 0.013)
         * @param {number} targetYear  Year to project to (1-based)
         * @returns {number} account value in VND
         */
        project: function (premium, payYears, rate, targetYear) {
            var self = this;
            var netRate = rate - self.FUND_MGMT_FEE; // net of fund management fee
            var accountValue = 0;
            var loyaltyAccum = 0;

            for (var yr = 1; yr <= targetYear; yr++) {
                // Add premium if within payment period
                if (yr <= payYears) {
                    var chargeIdx    = Math.min(yr - 1, self.INITIAL_CHARGE_RATES.length - 1);
                    var chargeRate   = self.INITIAL_CHARGE_RATES[chargeIdx];
                    var netPremium   = premium * (1 - chargeRate);
                    var initialCharge = premium * chargeRate;
                    accountValue += netPremium;
                    loyaltyAccum += initialCharge;
                }
                // Grow both at net rate
                accountValue = accountValue * (1 + netRate);
                loyaltyAccum = loyaltyAccum * (1 + netRate);
                // Deduct annual policy management fee
                accountValue -= self.POLICY_MGMT_FEE;
                accountValue = Math.max(0, accountValue);
            }

            // Add loyalty bonus at Year 20+
            if (targetYear >= 20) {
                accountValue += loyaltyAccum;
            }

            return Math.round(accountValue);
        },

        /**
         * Projects account value WITH annual withdrawal from Year 11.
         * Withdrawal = premium × min(payYears, 10) × 10%, deducted each year 11+.
         * If account balance < withdrawal amount, drains remaining balance.
         */
        projectWithWithdrawal: function (premium, payYears, rate, targetYear) {
            var self = this;
            var netRate = rate - self.FUND_MGMT_FEE;
            var accountValue = 0;
            var loyaltyAccum = 0;
            var withdrawAmount = premium * Math.min(payYears, 10) * 0.10;

            for (var yr = 1; yr <= targetYear; yr++) {
                if (yr <= payYears) {
                    var chargeIdx  = Math.min(yr - 1, self.INITIAL_CHARGE_RATES.length - 1);
                    var chargeRate = self.INITIAL_CHARGE_RATES[chargeIdx];
                    accountValue  += premium * (1 - chargeRate);
                    loyaltyAccum  += premium * chargeRate;
                }
                accountValue = accountValue * (1 + netRate);
                loyaltyAccum = loyaltyAccum * (1 + netRate);
                accountValue -= self.POLICY_MGMT_FEE;

                // Annual withdrawal from Year 11 onwards
                if (yr >= 11) {
                    accountValue -= Math.min(withdrawAmount, accountValue);
                }

                accountValue = Math.max(0, accountValue);
            }

            if (targetYear >= 20) {
                accountValue += loyaltyAccum;
            }

            return Math.round(accountValue);
        },

        getSurrenderCharge: function (year) {
            return this.SURRENDER_CHARGES[year] || 0;
        },

        /* Computes withdrawal value = account × (1 − surrender charge) */
        getWithdrawable: function (accountValue, year) {
            var charge = this.getSurrenderCharge(year);
            return Math.round(accountValue * (1 - charge));
        },

        fmtVND: function (v) {
            if (v <= 0) return '—';
            if (v >= 1e9)  return (v / 1e9).toFixed(2).replace(/\.?0+$/, '') + ' tỷ';
            if (v >= 1e6)  return Math.round(v / 1e6) + ' tr';
            return Math.round(v / 1e3) + ' nghìn';
        },

        fmtVNDFull: function (v) {
            if (v <= 0) return '—';
            return v.toLocaleString('vi-VN') + ' đ';
        },

        /* ── Update all outputs ───────────────────────── */
        updateAll: function () {
            var self = this;
            var p    = self.premium;
            var py   = self.payYears;
            var yrs  = self.PROJECTION_YEARS;
            var wm   = self.withdrawalMode;

            // Summary cards
            self.el.totalPremium.textContent     = self.fmtVND(p * py);
            self.el.freeWithdrawYear.textContent = 'Từ Năm thứ 6';
            self.el.loyaltyBonus.textContent     = 'Cuối Năm 20';

            // Year 20 Package Card
            self.updateYear20Package();

            // Update withdrawal info banner
            if (self.el.withdrawInfo) {
                if (wm) {
                    var annualAmt = p * Math.min(py, 10) * 0.10;
                    self.el.withdrawInfo.style.display = 'block';
                    if (self.el.annualWithdrawal) {
                        self.el.annualWithdrawal.textContent = self.fmtVND(annualAmt) + '/năm';
                    }
                } else {
                    self.el.withdrawInfo.style.display = 'none';
                }
            }

            // Build projection data arrays
            var labelsArr = [], highArr = [], lowArr = [];
            for (var yr = 1; yr <= yrs; yr++) {
                labelsArr.push('Năm ' + yr);
                if (wm) {
                    highArr.push(Math.round(self.projectWithWithdrawal(p, py, self.HIGH_RATE, yr) / 1e6));
                    lowArr.push(Math.round(self.projectWithWithdrawal(p, py, self.LOW_RATE,  yr) / 1e6));
                } else {
                    highArr.push(Math.round(self.project(p, py, self.HIGH_RATE, yr) / 1e6));
                    lowArr.push(Math.round(self.project(p, py, self.LOW_RATE,  yr) / 1e6));
                }
            }

            // Update or create Line Chart
            self.updateLineChart(labelsArr, highArr, lowArr, py, wm);

            // Build table
            self.buildTable(p, py, yrs, wm);
        },

        updateLineChart: function (labels, highData, lowData, payYears, withdrawalMode) {
            var self = this;
            var ctx  = self.el.finCanvas.getContext('2d');

            var highLabel = withdrawalMode ? 'Sau rút 10%/năm (Tỷ suất 9%)' : 'Tỷ suất Cao (9%/năm)';
            var lowLabel  = withdrawalMode ? 'Sau rút 10%/năm (Tỷ suất 1.3%)' : 'Tỷ suất Thấp (1.3%/năm)';

            if (self.lineChart) {
                self.lineChart.data.labels                       = labels;
                self.lineChart.data.datasets[0].data             = highData;
                self.lineChart.data.datasets[0].label            = highLabel;
                self.lineChart.data.datasets[1].data             = lowData;
                self.lineChart.data.datasets[1].label            = lowLabel;
                self.lineChart.update();
                return;
            }

            self.lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: highLabel,
                            data:  highData,
                            borderColor:     '#00843D',
                            backgroundColor: 'rgba(0,132,61,0.10)',
                            borderWidth: 2.5,
                            pointRadius:      3,
                            pointHoverRadius: 6,
                            pointBackgroundColor: '#00843D',
                            tension: 0.4,
                            fill: true,
                        },
                        {
                            label: lowLabel,
                            data:  lowData,
                            borderColor:      '#F5A623',
                            backgroundColor:  'rgba(245,166,35,0.08)',
                            borderWidth: 2,
                            pointRadius:       3,
                            pointHoverRadius:  6,
                            pointBackgroundColor: '#F5A623',
                            borderDash: [5, 4],
                            tension: 0.4,
                            fill: true,
                        }
                    ]
                },
                options: {
                    responsive:           true,
                    maintainAspectRatio:  false,
                    animation: { duration: 400, easing: 'easeInOutQuart' },
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (v) { return v + ' tr'; },
                                color: '#6b7280',
                                font: { size: 11, family: "'Inter',sans-serif" }
                            },
                            grid: { color: 'rgba(0,0,0,0.06)' },
                            border: { display: false }
                        },
                        x: {
                            ticks: {
                                color: '#6b7280',
                                maxRotation: 0,
                                font: { size: 10, family: "'Inter',sans-serif" },
                                callback: function (val, idx) {
                                    // Show every 5 years
                                    return (idx + 1) % 5 === 0 || idx === 0 ? 'Năm ' + (idx + 1) : '';
                                }
                            },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.80)',
                            padding: 10,
                            cornerRadius: 8,
                            callbacks: {
                                label: function (ctx) {
                                    return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('vi-VN') + ' triệu';
                                }
                            }
                        },
                        datalabels: { display: false }
                    }
                }
            });
        },

        /**
         * Calculates the Loyalty Bonus (Thuong Tri An) to be paid at Year 20.
         * The bonus = sum of initial charges (Phi Ban Dau) each year compounded
         * at the guaranteed rate until Year 20.
         */
        calcLoyaltyBonus: function (premium, payYears) {
            var self = this;
            var effectiveYears = Math.min(payYears, 10);
            var rate = self.LOYALTY_RATES[effectiveYears] || 0.050;
            var total = 0;

            for (var yr = 1; yr <= effectiveYears; yr++) {
                var chargeIdx = Math.min(yr - 1, self.INITIAL_CHARGE_RATES.length - 1);
                var initialCharge = premium * self.INITIAL_CHARGE_RATES[chargeIdx];
                var yearsToGrow = 20 - yr;
                total += initialCharge * Math.pow(1 + rate, yearsToGrow);
            }

            return Math.round(total);
        },

        /**
         * Year 20 Package Card (Option D Enhanced).
         * Shows total paid, GTTK at year 20 (both 9% and 1.3%),
         * Loyalty Bonus added on top, ROI%, and reacts to withdrawal toggle.
         */
        updateYear20Package: function () {
            var self = this;
            var p    = self.premium;
            var py   = self.payYears;
            var wm   = self.withdrawalMode;
            var YEAR = 20;

            // Helper: safe getElementById
            function el(id) { return document.getElementById(id); }
            function set(id, val) { var e = el(id); if (e) e.textContent = val; }
            function cls(id, add, cls) {
                var e = el(id);
                if (!e) return;
                e.classList[add ? 'remove' : 'add']('hthbc-y20-hidden');
            }

            // --- Compute values ---
            var totalPaid = p * py;
            var bonus     = self.calcLoyaltyBonus(p, py);

            var highInvest = wm
                ? self.projectWithWithdrawal(p, py, self.HIGH_RATE, YEAR)
                : self.project(p, py, self.HIGH_RATE, YEAR);
            var lowInvest = wm
                ? self.projectWithWithdrawal(p, py, self.LOW_RATE, YEAR)
                : self.project(p, py, self.LOW_RATE, YEAR);

            var highTotal = highInvest + bonus;
            var lowTotal  = lowInvest  + bonus;

            var annualWithdraw  = p * Math.min(py, 10) * 0.10;
            var totalWithdrawn  = annualWithdraw * 10;

            var highRoi = totalPaid > 0 ? Math.round((highTotal / totalPaid - 1) * 100) : 0;
            var lowRoi  = totalPaid > 0 ? Math.round((lowTotal  / totalPaid - 1) * 100) : 0;

            var effectiveYears = Math.min(py, 10);
            var rate = self.LOYALTY_RATES[effectiveYears] || 0.050;

            // --- Update DOM ---
            set('hthbc-y20-total-paid', self.fmtVND(totalPaid));

            // Mode badge + withdrawn row
            cls('hthbc-y20-mode-badge',    wm);
            cls('hthbc-y20-withdrawn-row', wm);
            if (wm) {
                set('hthbc-y20-total-withdrawn', '~' + self.fmtVND(totalWithdrawn));
            }

            // Thuong Tri An
            var bonusFmt = '+' + self.fmtVND(bonus);
            set('hthbc-y20-bonus',      bonusFmt);
            set('hthbc-y20-low-bonus',  bonusFmt);
            set('hthbc-y20-rate-badge', (rate * 100).toFixed(1) + '%/năm');

            // Scenario: High (9%)
            set('hthbc-y20-high-invest', self.fmtVND(highInvest));
            set('hthbc-y20-high-total',  self.fmtVND(highTotal));
            set('hthbc-y20-high-roi',    (highRoi >= 0 ? '+' : '') + highRoi + '% so với vốn đã đóng');

            // Scenario: Low (1.3%)
            set('hthbc-y20-low-invest', self.fmtVND(lowInvest));
            set('hthbc-y20-low-total',  self.fmtVND(lowTotal));
            set('hthbc-y20-low-roi',    (lowRoi >= 0 ? '+' : '') + lowRoi + '% so với vốn đã đóng');
        },

        /* Legacy: kept for backward compat, now superseded by updateYear20Package */
        updateTriAnCalc: function () {
            var self = this;
            var effectiveYears = Math.min(self.payYears, 10);
            var rate   = self.LOYALTY_RATES[effectiveYears] || 0.050;
            var amount = self.calcLoyaltyBonus(self.premium, self.payYears);

            var badge    = document.getElementById('hthbc-tac-rate-badge');
            var amountEl = document.getElementById('hthbc-tac-amount');
            var condEl   = document.getElementById('hthbc-tac-condition');

            if (badge)    badge.textContent    = 'Lãi suất cam kết: ' + (rate * 100).toFixed(1) + '%/năm';
            if (amountEl) amountEl.textContent = self.fmtVND(amount);
            if (condEl)   condEl.textContent   = '(đóng đủ ' + effectiveYears + ' năm)';
        },

        /* Binds Smart Banner info buttons to open modal with contextual content */
        bindSmartBannerModals: function () {
            var overlay = document.getElementById('hthbc-modal-overlay');
            var modal   = document.getElementById('hthbc-modal');
            var content = document.getElementById('hthbc-modal-content');
            var closeBtn = document.getElementById('hthbc-modal-close');

            if (!overlay || !modal || !content) return;

            var MODAL_CONTENT = {
                guaranteed: '<span class="hthbc-modal-tag hthbc-modal-tag-green">🔒 CÓ CAM KẾT</span>'
                    + '<h3>Thưởng Tri Ân — Lãi Suất Cam Kết</h3>'
                    + '<p><strong>Tài Khoản Tri Ân</strong> là khoản Phí Ban Đầu bị khấu trừ từ phí bảo hiểm mỗi năm. Khoản tiền này được Manulife tích lũy và <strong>cam kết</strong> trả lại vào Năm hợp đồng thứ 20.</p>'
                    + '<p>Mức lãi suất cam kết tăng dần theo số năm bạn đóng phí đầy đủ và đúng hạn trong 10 năm đầu:</p>'
                    + '<table><thead><tr><th>Số năm đóng đầy đủ</th><th>Lãi suất cam kết</th></tr></thead>'
                    + '<tbody>'
                    + '<tr><td>3 – 5 năm</td><td><strong>2.5%/năm</strong></td></tr>'
                    + '<tr><td>6 năm</td><td><strong>3.0%/năm</strong></td></tr>'
                    + '<tr><td>7 năm</td><td><strong>3.5%/năm</strong></td></tr>'
                    + '<tr><td>8 năm</td><td><strong>4.0%/năm</strong></td></tr>'
                    + '<tr><td>9 năm</td><td><strong>4.5%/năm</strong></td></tr>'
                    + '<tr><td>10 năm</td><td><strong>5.0%/năm</strong></td></tr>'
                    + '</tbody></table>',

                variable: '<span class="hthbc-modal-tag hthbc-modal-tag-amber">📈 KHÔNG CAM KẾT</span>'
                    + '<h3>Tỷ Suất Đầu Tư — Không Đảm Bảo</h3>'
                    + '<p>Dòng tiền thực tế được mang đi đầu tư vào các <strong>Quỹ Liên Kết Đơn Vị</strong> (Quỹ Hưng Thịnh, Tăng Trưởng, Tích Lũy...). Kết quả đầu tư <strong>không được bảo đảm</strong>.</p>'
                    + '<p>Các mức tỷ suất trong bảng mô phỏng:</p>'
                    + '<table><thead><tr><th>Kịch bản</th><th>Tỷ suất</th><th>Ý nghĩa</th></tr></thead>'
                    + '<tbody>'
                    + '<tr><td>Tỷ suất cao</td><td><strong>9%/năm</strong></td><td>Giai đoạn quỹ ưu tiên cổ phiếu</td></tr>'
                    + '<tr><td>Tỷ suất thấp</td><td><strong>1.3%/năm</strong></td><td>Giai đoạn gần hưu — chuyển trái phiếu</td></tr>'
                    + '</tbody></table>'
                    + '<p style="margin-top:12px;font-size:12px;color:#c0392b;"><strong>Lưu ý:</strong> Giá trị tài khoản có thể tăng hoặc giảm tùy theo biến động thị trường. Con số 9%/1.3% chỉ mang tính tham khảo, không phải cam kết.</p>'
            };

            function openModal(type) {
                content.innerHTML = MODAL_CONTENT[type] || '';
                overlay.classList.add('open');
                document.body.style.overflow = 'hidden';
            }

            function closeModal() {
                overlay.classList.remove('open');
                document.body.style.overflow = '';
            }

            var btnGuaranteed = document.getElementById('hthbc-info-guaranteed');
            var btnVariable   = document.getElementById('hthbc-info-variable');

            if (btnGuaranteed) {
                btnGuaranteed.addEventListener('click', function () { openModal('guaranteed'); });
            }
            if (btnVariable) {
                btnVariable.addEventListener('click', function () { openModal('variable'); });
            }
            if (closeBtn) {
                closeBtn.addEventListener('click', closeModal);
            }
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) closeModal();
            });
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeModal();
            });
        },

        buildTable: function (p, py, yrs, withdrawalMode) {
            var self      = this;
            var tbody     = self.el.finTbody;
            var rows      = '';
            var totalPaid = 0;
            var milestones = { 3: true, 6: true, 20: true };

            for (var yr = 1; yr <= yrs; yr++) {
                if (yr <= py) totalPaid += p;

                var highVal, lowVal;
                if (withdrawalMode) {
                    highVal = self.projectWithWithdrawal(p, py, self.HIGH_RATE, yr);
                    lowVal  = self.projectWithWithdrawal(p, py, self.LOW_RATE,  yr);
                } else {
                    highVal = self.project(p, py, self.HIGH_RATE, yr);
                    lowVal  = self.project(p, py, self.LOW_RATE,  yr);
                }

                var charge      = self.getSurrenderCharge(yr);
                var withdrawHigh = self.getWithdrawable(highVal, yr);
                var chargeStr   = charge > 0
                    ? (charge * 100).toFixed(0) + '%'
                    : '<span class="hthbc-td-free">0% ✓</span>';
                var isMilestone = milestones[yr] ? ' hthbc-row-milestone' : '';
                var bonusNote   = yr === 20 ? ' 🎁' : '';
                var wdNote      = (withdrawalMode && yr >= 11) ? ' 💸' : '';
                // Helper: display value — show 'Hết quỹ' when 0 in withdrawal mode
                var fmtCell = function (v, isWithdrawal) {
                    if (v <= 0 && isWithdrawal) {
                        return '<span class="hthbc-td-depleted" title="Quỹ cạn do rút 10%/năm + lãi thấp hơn phí quản lý">Hết quỹ</span>';
                    }
                    return self.fmtVND(v);
                };

                rows += '<tr class="' + isMilestone + '">'
                    + '<td>' + yr + bonusNote + wdNote + '</td>'
                    + '<td>' + self.fmtVND(totalPaid) + '</td>'
                    + '<td class="hthbc-td-high">' + fmtCell(highVal, withdrawalMode) + '</td>'
                    + '<td class="hthbc-td-low">'  + fmtCell(lowVal,  withdrawalMode) + '</td>'
                    + '<td>' + chargeStr + '</td>'
                    + '<td class="hthbc-td-high">' + fmtCell(withdrawHigh, withdrawalMode) + '</td>'
                    + '</tr>';
            }

            tbody.innerHTML = rows;
        }
    };

    /* ═══════════════════════════════════════════════════
       SECTION 3: HISTORICAL FUND PERFORMANCE CHART
    ═══════════════════════════════════════════════════ */
    var HistoryChart = {
        LABELS: ['2020', '2021', '2022', '2023', '2024'],

        FUNDS: {
            growth:  { label: 'Tăng Trưởng', color: '#00843D', data: [9.7,  28.5, -29.5,  9.9, 14.1] },
            develop: { label: 'Phát Triển',  color: '#1E88E5', data: [11.7, 25.1, -24.1,  9.6, 12.1] },
            balance: { label: 'Cân Bằng',    color: '#F5A623', data: [13.5, 18.8, -16.9,  9.4,  9.3] },
            stable:  { label: 'Ổn Định',     color: '#9B9B9B', data: [ 5.5,  9.9,  -6.7,  9.6,  6.5] },
        },

        chart:        null,
        activeFunds:  { growth: true, develop: true, balance: true, stable: true },

        init: function () {
            var canvas = document.getElementById('hthbc-history-canvas');
            if (!canvas) return;
            this.buildChart(canvas);
            this.bindToggleButtons();
        },

        buildDatasets: function () {
            var self = this;
            return Object.keys(self.FUNDS).filter(function (k) {
                return self.activeFunds[k];
            }).map(function (k) {
                var f = self.FUNDS[k];
                return {
                    label:           f.label,
                    data:            f.data,
                    borderColor:     f.color,
                    backgroundColor: f.color + '22',
                    borderWidth: 2.5,
                    pointRadius:      5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: f.color,
                    tension: 0.35,
                    fill: false,
                };
            });
        },

        buildChart: function (canvas) {
            var self = this;
            var ctx  = canvas.getContext('2d');
            self.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels:   self.LABELS,
                    datasets: self.buildDatasets(),
                },
                options: {
                    responsive:          true,
                    maintainAspectRatio: false,
                    animation: { duration: 350, easing: 'easeInOutQuart' },
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        y: {
                            ticks: {
                                callback: function (v) { return v + '%'; },
                                color: '#6b7280',
                                font: { size: 11, family: "'Inter',sans-serif" }
                            },
                            grid: { color: 'rgba(0,0,0,0.07)' },
                            border: { display: false }
                        },
                        x: {
                            ticks: { color: '#374151', font: { size: 12, weight: '600', family: "'Inter',sans-serif" } },
                            grid: { display: false },
                            border: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0,0,0,0.80)',
                            padding: 10, cornerRadius: 8,
                            callbacks: {
                                label: function (ctx) {
                                    var v = ctx.parsed.y;
                                    return ' ' + ctx.dataset.label + ': ' + (v > 0 ? '+' : '') + v + '%';
                                }
                            }
                        },
                        datalabels: { display: false },
                        // Zero reference line
                        annotation: undefined
                    }
                },
                plugins: [{
                    id: 'zeroLine',
                    afterDraw: function (chart) {
                        var yScale = chart.scales.y;
                        var xScale = chart.scales.x;
                        if (!yScale || !xScale) return;
                        var y = yScale.getPixelForValue(0);
                        var ctx2 = chart.ctx;
                        ctx2.save();
                        ctx2.beginPath();
                        ctx2.moveTo(xScale.left, y);
                        ctx2.lineTo(xScale.right, y);
                        ctx2.strokeStyle = 'rgba(220,38,38,0.4)';
                        ctx2.lineWidth   = 1.5;
                        ctx2.setLineDash([5, 4]);
                        ctx2.stroke();
                        ctx2.restore();
                    }
                }]
            });
        },

        bindToggleButtons: function () {
            var self = this;
            var btns = document.querySelectorAll('.hthbc-hist-btn');
            btns.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var fund = this.dataset.fund;
                    self.activeFunds[fund] = !self.activeFunds[fund];
                    this.classList.toggle('active', self.activeFunds[fund]);
                    self.chart.data.datasets = self.buildDatasets();
                    self.chart.update();
                });
            });
        }
    };

})();
