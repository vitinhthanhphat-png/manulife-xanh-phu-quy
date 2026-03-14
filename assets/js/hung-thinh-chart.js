/**
 * Hung Thinh Bar Chart v2 — Manulife Xanh Phu Quy
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

        // State
        premium:    250000000,
        payYears:   10,
        finChartHigh: null,
        finChartLow:  null,
        lineChart:    null,

        init: function () {
            this.bindElements();
            this.bindEvents();
            this.updateAll();
        },

        bindElements: function () {
            this.el = {
                premiumSelect:   document.getElementById('hthbc-premium-select'),
                payYearsSelect:  document.getElementById('hthbc-payyears-select'),
                totalPremium:    document.getElementById('hthbc-total-premium'),
                freeWithdrawYear: document.getElementById('hthbc-free-withdraw-year'),
                loyaltyBonus:    document.getElementById('hthbc-loyalty-bonus'),
                finCanvas:       document.getElementById('hthbc-fin-canvas'),
                finTbody:        document.getElementById('hthbc-fin-tbody'),
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
        },

        /* ── Core financial projection engine ─────────── */
        /**
         * Projects account value at end of given year.
         * @param {number} premium   Annual premium in VND
         * @param {number} payYears  Years customer pays premium
         * @param {number} rate      Annual investment rate (0.09 or 0.013)
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

            // Summary cards
            self.el.totalPremium.textContent    = self.fmtVND(p * py) + 'đ';
            self.el.freeWithdrawYear.textContent = 'Từ Năm thứ 6';
            self.el.loyaltyBonus.textContent     = 'Cuối Năm 20';

            // Build projection data arrays
            var labelsArr = [], highArr = [], lowArr = [];
            for (var yr = 1; yr <= yrs; yr++) {
                labelsArr.push('Năm ' + yr);
                highArr.push(Math.round(self.project(p, py, self.HIGH_RATE, yr) / 1e6));
                lowArr.push(Math.round(self.project(p, py, self.LOW_RATE,  yr) / 1e6));
            }

            // Update or create Line Chart
            self.updateLineChart(labelsArr, highArr, lowArr, py);

            // Build table
            self.buildTable(p, py, yrs);
        },

        updateLineChart: function (labels, highData, lowData, payYears) {
            var self = this;
            var ctx  = self.el.finCanvas.getContext('2d');

            var payStopAnnotation = payYears;

            if (self.lineChart) {
                self.lineChart.data.labels              = labels;
                self.lineChart.data.datasets[0].data    = highData;
                self.lineChart.data.datasets[1].data    = lowData;
                self.lineChart.update();
                return;
            }

            self.lineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Tỷ suất Cao (9%/năm)',
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
                            label: 'Tỷ suất Thấp (1.3%/năm)',
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
                                    return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString('vi-VN') + ' triệu đ';
                                }
                            }
                        },
                        datalabels: { display: false }
                    }
                }
            });
        },

        buildTable: function (p, py, yrs) {
            var self   = this;
            var tbody  = self.el.finTbody;
            var rows   = '';
            var totalPaid = 0;

            var milestones = { 3: true, 6: true, 20: true };

            for (var yr = 1; yr <= yrs; yr++) {
                if (yr <= py) totalPaid += p;
                var highVal = self.project(p, py, self.HIGH_RATE, yr);
                var lowVal  = self.project(p, py, self.LOW_RATE,  yr);
                var charge  = self.getSurrenderCharge(yr);
                var withdrawHigh = self.getWithdrawable(highVal, yr);
                var chargeStr = charge > 0 ? (charge * 100).toFixed(0) + '%' : '<span class="hthbc-td-free">0% ✓</span>';
                var isMilestone = milestones[yr] ? ' hthbc-row-milestone' : '';

                // Bonus note at year 20
                var bonusNote = yr === 20 ? ' 🎁' : '';

                rows += '<tr class="' + isMilestone + '">'
                    + '<td>' + yr + bonusNote + '</td>'
                    + '<td>' + self.fmtVND(totalPaid) + 'đ</td>'
                    + '<td class="hthbc-td-high">' + self.fmtVND(highVal) + 'đ</td>'
                    + '<td class="hthbc-td-low">'  + self.fmtVND(lowVal)  + 'đ</td>'
                    + '<td>' + chargeStr + '</td>'
                    + '<td class="hthbc-td-high">' + self.fmtVND(withdrawHigh) + 'đ</td>'
                    + '</tr>';
            }

            tbody.innerHTML = rows;
        }
    };

})();
