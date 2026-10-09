/**
 * DealHunter AI - Application Logic
 * Xử lý tìm kiếm, lọc, render deal, copy voucher, tính tiết kiệm, đếm ngược và modal
 */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Quản lý trạng thái State
    let deals = getStoredDeals();
    let reviews = getStoredReviews();
    let currentPlatform = "all";
    let currentCategory = "all";
    let searchQuery = "";
    let currentSort = "discount-desc";

    // 2. Khởi tạo Theme Sáng / Tối
    initTheme();

    // 3. Khởi tạo Bộ Đếm Ngược Flash Sale
    initCountdownTimer();

    // 4. Khởi tạo Máy Tính Tiết Kiệm
    initSavingsCalculator();

    // 5. Render Dữ Liệu
    renderHeroSpotlight(deals);
    applyFiltersAndRender();
    renderReviews(reviews);

    // 6. Gán sự kiện cho Bộ Lọc và Tìm Kiếm
    setupFilterEvents();
    setupSearchEvents();
    setupModalEvents();
    setupQuickCategoryFooterEvents();
});

// ==========================================
// ĐỊNH DẠNG TIỀN TỆ & CON SỐ
// ==========================================
function formatCurrency(amount) {
    if (isNaN(amount)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatNumber(num) {
    return new Intl.NumberFormat("vi-VN").format(num);
}

// ==========================================
// QUẢN LÝ THEME
// ==========================================
function initTheme() {
    const savedTheme = localStorage.getItem("dealhunter_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    const toggleBtn = document.getElementById("themeToggleBtn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("dealhunter_theme", next);
            updateThemeIcon(next);
        });
    }
}

function updateThemeIcon(theme) {
    const iconSpan = document.getElementById("themeIcon");
    if (iconSpan) {
        iconSpan.textContent = theme === "dark" ? "☀️" : "🌙";
    }
}

// ==========================================
// FLASH SALE COUNTDOWN
// ==========================================
function initCountdownTimer() {
    let totalSeconds = 6 * 3600 + 42 * 60 + 19; // 6h 42m 19s ban đầu

    const hElem = document.getElementById("timerHours");
    const mElem = document.getElementById("timerMinutes");
    const sElem = document.getElementById("timerSeconds");

    setInterval(() => {
        if (totalSeconds <= 0) {
            totalSeconds = 12 * 3600; // Reset lại 12h
        }
        totalSeconds--;

        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (hElem) hElem.textContent = String(h).padStart(2, "0");
        if (mElem) mElem.textContent = String(m).padStart(2, "0");
        if (sElem) sElem.textContent = String(s).padStart(2, "0");
    }, 1000);
}

// ==========================================
// HERO SPOTLIGHT DEAL
// ==========================================
function renderHeroSpotlight(dealsList) {
    const spotlightDeal = dealsList.find(d => d.flashSale) || dealsList[0];
    const container = document.getElementById("heroSpotlightDeal");
    if (!container || !spotlightDeal) return;

    const targetUrl = buildAffiliateUrl(spotlightDeal.affiliateUrl, spotlightDeal.platform);

    container.innerHTML = `
        <div style="display: flex; gap: 16px; align-items: center; margin-top: 10px;">
            <div style="width: 85px; height: 85px; border-radius: 10px; overflow: hidden; flex-shrink: 0; background: #000;">
                <img src="${spotlightDeal.image}" alt="${spotlightDeal.title}" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div style="flex: 1;">
                <span class="logo-badge" style="background: rgba(238, 77, 45, 0.2); color: #ff6b81; border: none; margin-bottom: 4px; display: inline-block;">
                    ${spotlightDeal.platform.toUpperCase()}
                </span>
                <h4 style="font-size: 0.98rem; font-weight: 700; line-height: 1.3; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${spotlightDeal.title}
                </h4>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span style="font-size: 1.25rem; font-weight: 800; color: #ff4757; font-family: 'Outfit';">
                        ${formatCurrency(spotlightDeal.dealPrice)}
                    </span>
                    <span style="font-size: 0.82rem; color: var(--text-muted); text-decoration: line-through;">
                        ${formatCurrency(spotlightDeal.originalPrice)}
                    </span>
                    <span style="background: var(--gradient-fire); color: #fff; font-size: 0.72rem; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
                        -${spotlightDeal.discountPercent}%
                    </span>
                </div>
            </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 10px;">
            <a href="${targetUrl}" target="_blank" rel="noopener noreferrer nofollow" onclick="trackAffiliateClick('${spotlightDeal.id}')" class="btn-get-deal" style="flex: 1; padding: 10px;">
                🚀 Săn Ngay Kẻo Hết
            </a>
            <button class="btn-copy-coupon" onclick="copyCouponCode('${spotlightDeal.couponCode}')" style="padding: 10px 14px;">
                Mã: ${spotlightDeal.couponCode}
            </button>
        </div>
    `;
}

// ==========================================
// BỘ LỌC, SẮP XẾP & TÌM KIẾM
// ==========================================
function setupFilterEvents() {
    // Platform Chips
    const platformBtns = document.querySelectorAll(".platform-chips .chip-btn");
    platformBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            platformBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentPlatform = btn.dataset.platform;
            applyFiltersAndRender();
        });
    });

    // Category Chips
    const categoryBtns = document.querySelectorAll(".category-chips .chip-btn");
    categoryBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            categoryBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCategory = btn.dataset.category;
            applyFiltersAndRender();
        });
    });

    // Sort Dropdown
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSort = e.target.value;
            applyFiltersAndRender();
        });
    }
}

function setupSearchEvents() {
    const searchInput = document.getElementById("globalSearchInput");
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchQuery = e.target.value.trim().toLowerCase();
            applyFiltersAndRender();
        }, 200);
    });
}

function setupQuickCategoryFooterEvents() {
    document.querySelectorAll("[data-filter-cat]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const cat = link.getAttribute("data-filter-cat");
            const btn = document.querySelector(`.category-chips .chip-btn[data-category="${cat}"]`);
            if (btn) btn.click();
            document.getElementById("hot-deals").scrollIntoView({ behavior: "smooth" });
        });
    });

    document.querySelectorAll("[data-filter-plat]").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const plat = link.getAttribute("data-filter-plat");
            const btn = document.querySelector(`.platform-chips .chip-btn[data-platform="${plat}"]`);
            if (btn) btn.click();
            document.getElementById("hot-deals").scrollIntoView({ behavior: "smooth" });
        });
    });
}

function applyFiltersAndRender() {
    let result = [...deals];

    // Filter by Platform
    if (currentPlatform !== "all") {
        result = result.filter(d => d.platform.toLowerCase() === currentPlatform.toLowerCase());
    }

    // Filter by Category
    if (currentCategory !== "all") {
        result = result.filter(d => d.category.toLowerCase() === currentCategory.toLowerCase());
    }

    // Filter by Search Query
    if (searchQuery) {
        result = result.filter(d =>
            d.title.toLowerCase().includes(searchQuery) ||
            d.description.toLowerCase().includes(searchQuery) ||
            d.category.toLowerCase().includes(searchQuery) ||
            d.platform.toLowerCase().includes(searchQuery)
        );
    }

    // Sort logic
    if (currentSort === "discount-desc") {
        result.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (currentSort === "price-asc") {
        result.sort((a, b) => a.dealPrice - b.dealPrice);
    } else if (currentSort === "price-desc") {
        result.sort((a, b) => b.dealPrice - a.dealPrice);
    } else if (currentSort === "sold-desc") {
        result.sort((a, b) => b.soldCount - a.soldCount);
    } else if (currentSort === "rating-desc") {
        result.sort((a, b) => b.rating - a.rating);
    }

    renderDealsGrid(result);

    // Update Counter
    const countElem = document.getElementById("displayedCount");
    if (countElem) countElem.textContent = result.length;
}

// ==========================================
// RENDER DEALS GRID
// ==========================================
function renderDealsGrid(items) {
    const grid = document.getElementById("dealsGrid");
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">
                <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
                <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Không tìm thấy deal phù hợp</h3>
                <p style="color: var(--text-secondary); font-size: 0.95rem;">Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn "Tất cả sàn".</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map(deal => {
        const savings = deal.originalPrice - deal.dealPrice;
        const affiliateTargetUrl = buildAffiliateUrl(deal.affiliateUrl, deal.platform);
        const platformBadgeClass = `badge-${deal.platform.toLowerCase()}`;

        return `
            <article class="deal-card" id="card-${deal.id}">
                <div class="card-media">
                    <img src="${deal.image}" alt="${deal.title}" loading="lazy">
                    <div class="card-badge-discount">-${deal.discountPercent}%</div>
                    <div class="card-platform-badge ${platformBadgeClass}">
                        ${deal.platform.toUpperCase()}
                    </div>
                </div>

                <div class="card-content">
                    <div class="card-rating-sold">
                        <span class="stars">★ ${deal.rating.toFixed(1)}</span>
                        <span>Đã bán: ${formatNumber(deal.soldCount)}</span>
                    </div>

                    <h3 class="card-title" title="${deal.title}">
                        ${deal.title}
                    </h3>

                    <div class="card-prices">
                        <div class="price-row">
                            <span class="current-price">${formatCurrency(deal.dealPrice)}</span>
                            <span class="original-price">${formatCurrency(deal.originalPrice)}</span>
                        </div>
                        <div class="savings-tag">
                            Tiết kiệm ${formatCurrency(savings)}
                        </div>
                    </div>

                    ${deal.couponCode ? `
                        <div class="coupon-box">
                            <div class="coupon-info">
                                <span class="coupon-code-text">${deal.couponCode}</span>
                                <span class="coupon-sub">${deal.couponDiscount || "Mã giảm giá độc quyền"}</span>
                            </div>
                            <button class="btn-copy-coupon" onclick="copyCouponCode('${deal.couponCode}')">
                                Copy Mã
                            </button>
                        </div>
                    ` : ''}

                    <div class="card-actions">
                        <a href="${affiliateTargetUrl}" target="_blank" rel="noopener noreferrer nofollow" 
                           class="btn-get-deal" onclick="trackAffiliateClick('${deal.id}')">
                            <span>Đến Sàn Mua Deal</span>
                            <span>⚡</span>
                        </a>
                        <button class="btn-review-link" title="Xem chi tiết & Đánh giá" onclick="openDealDetailModal('${deal.id}')">
                            👁️
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

// ==========================================
// RENDER BÀI VIẾT REVIEW CHUẨN SEO
// ==========================================
function renderReviews(reviewItems) {
    const container = document.getElementById("reviewsGrid");
    if (!container) return;

    container.innerHTML = reviewItems.map(review => {
        return `
            <article class="review-card" id="rev-${review.id}">
                <div class="review-card-media">
                    <img src="${review.featuredImage}" alt="${review.title}" loading="lazy">
                    <div class="review-badge-seo">ĐÁNH GIÁ CHUYÊN SÂU</div>
                </div>
                <div class="review-body">
                    <div class="review-meta">
                        <span>📅 ${review.publishedDate}</span>
                        <span>•</span>
                        <span>⏱️ ${review.readTime}</span>
                        <span>•</span>
                        <span style="color: var(--accent-gold); font-weight: 700;">★ ${review.rating}</span>
                    </div>
                    <h3 class="review-title">
                        ${review.title}
                    </h3>
                    <p class="review-summary">
                        ${review.summary}
                    </p>
                    <div class="pros-preview">
                        <div class="pros-preview-title">✓ Điểm Nổi Bật Nhất:</div>
                        <div>${review.pros[0]}</div>
                    </div>
                    <button class="btn-read-review" onclick="openReviewModal('${review.id}')">
                        <span>Đọc Đánh Giá Đầy Đủ</span>
                        <span>→</span>
                    </button>
                </div>
            </article>
        `;
    }).join("");
}

// ==========================================
// TRACKING & SAO CHÉP MÃ VOUCHER
// ==========================================
function copyCouponCode(code) {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
        showToast(`Đã sao chép mã voucher "${code}"! Áp dụng tại bước thanh toán để giảm thêm.`);
    }).catch(() => {
        // Fallback
        const temp = document.createElement("input");
        temp.value = code;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        document.body.removeChild(temp);
        showToast(`Đã sao chép mã voucher "${code}"!`);
    });
}

function showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <span class="toast-icon">✅</span>
        <div style="font-size: 0.9rem; font-weight: 600; line-height: 1.4;">${message}</div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

function trackAffiliateClick(dealId) {
    try {
        const clicks = JSON.parse(localStorage.getItem("dealhunter_click_stats") || "{}");
        clicks[dealId] = (clicks[dealId] || 0) + 1;
        clicks["_total"] = (clicks["_total"] || 0) + 1;
        localStorage.setItem("dealhunter_click_stats", JSON.stringify(clicks));
    } catch (e) {
        console.error("Lỗi lưu lượt click:", e);
    }
}

// ==========================================
// MÁY TÍNH TIẾT KIỆM (SAVINGS CALCULATOR)
// ==========================================
function initSavingsCalculator() {
    const originalInput = document.getElementById("calcOriginalPrice");
    const discountInput = document.getElementById("calcDiscountPercent");
    const voucherInput = document.getElementById("calcExtraVoucher");
    const savingsOutput = document.getElementById("calcSavingsOutput");
    const finalPriceOutput = document.getElementById("calcFinalPrice");

    function recalculate() {
        const orig = parseFloat(originalInput.value) || 0;
        const discPercent = parseFloat(discountInput.value) || 0;
        const voucher = parseFloat(voucherInput.value) || 0;

        const discountFromPercent = orig * (discPercent / 100);
        const totalSaved = discountFromPercent + voucher;
        const finalPrice = Math.max(0, orig - totalSaved);

        if (savingsOutput) savingsOutput.textContent = formatCurrency(totalSaved);
        if (finalPriceOutput) finalPriceOutput.textContent = formatCurrency(finalPrice);
    }

    if (originalInput) originalInput.addEventListener("input", recalculate);
    if (discountInput) discountInput.addEventListener("input", recalculate);
    if (voucherInput) voucherInput.addEventListener("input", recalculate);
    recalculate();
}

// ==========================================
// MODAL DETAILS (DEAL & SEO REVIEW)
// ==========================================
function setupModalEvents() {
    // Deal modal close
    const dealModalOverlay = document.getElementById("dealModalOverlay");
    const closeDealBtn = document.getElementById("closeDealModalBtn");
    if (closeDealBtn && dealModalOverlay) {
        closeDealBtn.addEventListener("click", () => dealModalOverlay.classList.remove("active"));
        dealModalOverlay.addEventListener("click", (e) => {
            if (e.target === dealModalOverlay) dealModalOverlay.classList.remove("active");
        });
    }

    // Review modal close
    const reviewModalOverlay = document.getElementById("reviewModalOverlay");
    const closeReviewBtn = document.getElementById("closeReviewModalBtn");
    if (closeReviewBtn && reviewModalOverlay) {
        closeReviewBtn.addEventListener("click", () => reviewModalOverlay.classList.remove("active"));
        reviewModalOverlay.addEventListener("click", (e) => {
            if (e.target === reviewModalOverlay) reviewModalOverlay.classList.remove("active");
        });
    }

    // Keyboard ESC close
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            if (dealModalOverlay) dealModalOverlay.classList.remove("active");
            if (reviewModalOverlay) reviewModalOverlay.classList.remove("active");
        }
    });
}

function openDealDetailModal(dealId) {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    const modalBody = document.getElementById("dealModalBody");
    const overlay = document.getElementById("dealModalOverlay");
    if (!modalBody || !overlay) return;

    const affiliateUrl = buildAffiliateUrl(deal.affiliateUrl, deal.platform);
    const savings = deal.originalPrice - deal.dealPrice;

    modalBody.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start;">
            <div style="border-radius: var(--radius-md); overflow: hidden; background: #000;">
                <img src="${deal.image}" alt="${deal.title}" style="width: 100%; height: 320px; object-fit: cover;">
            </div>
            <div>
                <div class="logo-badge" style="background: rgba(99, 102, 241, 0.15); margin-bottom: 8px;">
                    SÀN: ${deal.platform.toUpperCase()}
                </div>
                <h2 style="font-size: 1.4rem; line-height: 1.3; margin-bottom: 12px;">${deal.title}</h2>
                <div style="display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px;">
                    <span style="font-size: 1.8rem; font-weight: 800; color: #ff4757; font-family: 'Outfit';">
                        ${formatCurrency(deal.dealPrice)}
                    </span>
                    <span style="font-size: 1rem; color: var(--text-muted); text-decoration: line-through;">
                        ${formatCurrency(deal.originalPrice)}
                    </span>
                    <span style="background: var(--gradient-fire); color: #fff; font-size: 0.78rem; font-weight: 800; padding: 3px 8px; border-radius: 4px;">
                        -${deal.discountPercent}%
                    </span>
                </div>
                <div style="color: var(--accent-green); font-size: 0.88rem; font-weight: 600; margin-bottom: 16px;">
                    Tiết kiệm được: ${formatCurrency(savings)}
                </div>

                <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 16px;">
                    ${deal.description}
                </p>

                ${deal.highlights && deal.highlights.length ? `
                    <div style="margin-bottom: 20px;">
                        <h4 style="font-size: 0.95rem; margin-bottom: 8px;">Đặc điểm nổi bật:</h4>
                        <ul style="padding-left: 20px; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.6;">
                            ${deal.highlights.map(h => `<li>${h}</li>`).join("")}
                        </ul>
                    </div>
                ` : ''}

                <div style="display: flex; gap: 12px; margin-top: 20px;">
                    <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer nofollow" onclick="trackAffiliateClick('${deal.id}')" class="btn-get-deal" style="flex: 1; padding: 12px;">
                        🚀 Mua Ngay Trên ${deal.platform.toUpperCase()}
                    </a>
                    ${deal.couponCode ? `
                        <button class="btn-copy-coupon" onclick="copyCouponCode('${deal.couponCode}')" style="padding: 12px 16px;">
                            Copy Mã: ${deal.couponCode}
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    overlay.classList.add("active");
}

function openReviewModal(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const modalBody = document.getElementById("reviewModalBody");
    const overlay = document.getElementById("reviewModalOverlay");
    if (!modalBody || !overlay) return;

    const relatedDeal = deals.find(d => d.id === review.dealId);
    const affiliateUrl = relatedDeal ? buildAffiliateUrl(relatedDeal.affiliateUrl, relatedDeal.platform) : "#";

    modalBody.innerHTML = `
        <div style="max-width: 680px; margin: 0 auto;">
            <div class="logo-badge" style="background: rgba(16, 185, 129, 0.2); color: var(--accent-green); margin-bottom: 8px;">
                ĐÁNH GIÁ CHUẨN SEO
            </div>
            <h1 style="font-size: 1.8rem; line-height: 1.3; margin-bottom: 12px;">${review.title}</h1>
            <div style="display: flex; gap: 14px; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
                <span>Tác giả: <strong>${review.author}</strong></span>
                <span>•</span>
                <span>Ngày đăng: ${review.publishedDate}</span>
                <span>•</span>
                <span style="color: var(--accent-gold); font-weight: 700;">Đánh giá: ${review.rating} / 5.0</span>
            </div>

            <div style="border-radius: var(--radius-md); overflow: hidden; margin-bottom: 24px;">
                <img src="${review.featuredImage}" alt="${review.title}" style="width: 100%; height: 300px; object-fit: cover;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid var(--accent-green); padding: 14px; border-radius: var(--radius-sm);">
                    <h4 style="color: var(--accent-green); margin-bottom: 8px; font-size: 0.95rem;">Ưu Điểm Nổi Bật</h4>
                    <ul style="padding-left: 18px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                        ${review.pros.map(p => `<li>${p}</li>`).join("")}
                    </ul>
                </div>

                <div style="background: rgba(255, 71, 87, 0.08); border-left: 3px solid #ff4757; padding: 14px; border-radius: var(--radius-sm);">
                    <h4 style="color: #ff4757; margin-bottom: 8px; font-size: 0.95rem;">Nhược Điểm Cần Lưu Ý</h4>
                    <ul style="padding-left: 18px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                        ${review.cons.map(c => `<li>${c}</li>`).join("")}
                    </ul>
                </div>
            </div>

            <div style="line-height: 1.8; color: var(--text-secondary); font-size: 0.98rem; margin-bottom: 24px;" class="review-rich-content">
                ${review.contentHtml}
            </div>

            <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 20px; text-align: center; margin-top: 30px;">
                <h3 style="font-size: 1.25rem; margin-bottom: 8px;">Lời Kết & Mức Giá Khuyên Dùng</h3>
                <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 16px;">
                    ${review.verdict}
                </p>
                ${relatedDeal ? `
                    <a href="${affiliateUrl}" target="_blank" rel="noopener noreferrer nofollow" onclick="trackAffiliateClick('${relatedDeal.id}')" class="btn-get-deal" style="display: inline-flex; padding: 12px 28px; font-size: 1rem;">
                        🛒 Mua Sản Phẩm Với Giá Ưu Đãi Nhất Tại ${relatedDeal.platform.toUpperCase()}
                    </a>
                ` : ''}
            </div>
        </div>
    `;

    overlay.classList.add("active");
}
