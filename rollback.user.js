// ==UserScript==
// @name         크랙 웹기능 부분 롤백
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  프사 원본 비율 100% 존중(잘림/여백 없음), 뱃지 정상화, 상세페이지 블러 삭제, 좋아요 우측하단
// @match        *://crack.wrtn.ai/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    const customCSS = `
        /* =========================================
           1. [목록 레이아웃] 병렬 깨짐 방지 및 세로 배치
           ========================================= */
        .flex.items-center > p.typo-text-sm_leading-paragraph_medium,
        .flex.items-center > div.w-3\\.5.h-3\\.5 {
            display: none !important;
        }
        .flex.flex-col.gap-1 > .flex.items-center {
            flex-direction: column !important;
            align-items: flex-start !important;
            margin-top: 2px !important;
        }

        /* =========================================
           2. [채팅창 목록] 좌측 패널 썸네일 1:1 고정 & 뱃지 겹침
           ========================================= */
        a[href*="/episodes/"] {
            position: relative !important;
        }

        div[width="32"][height="48"],
        a[href*="/episodes/"] .aspect-\\[2\\/3\\] {
            width: 48px !important;
            height: 48px !important;
            aspect-ratio: 1 / 1 !important;
        }

        /* 크리지널 로고(crack original)는 제외하고 캐릭터 프사만 1:1로 꽉 채움 */
        div[width="32"][height="48"] img:not(.blur-md):not([alt="crack original"]),
        a[href*="/episodes/"] .aspect-\\[2\\/3\\] img:not(.blur-md):not([alt="crack original"]) {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
        }

        div[width="32"][height="48"] img.blur-md,
        a[href*="/episodes/"] .aspect-\\[2\\/3\\] img.blur-md {
            display: none !important;
        }

        /* 알림 뱃지 위치 보정 */
        a[href*="/episodes/"] div[class*="Badge"] {
            position: absolute !important;
            top: 4px !important;
            left: 4px !important;
            z-index: 20 !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 4px !important;
            transform: scale(0.8) !important;
            transform-origin: top left !important;
        }

        /* =========================================
           3. [스토리 상세 페이지] 원본 비율 자동 맞춤 & 블러 삭제
           ========================================= */
        .css-bdwsp8 .bg-cover.bg-center {
            background-image: none !important;
            background-color: transparent !important;
            width: auto !important;
            height: auto !important;
            min-height: unset !important;
            padding: 0 !important;
        }
        .css-bdwsp8 .backdrop-blur-\\[10px\\] { display: none !important; }

        .css-1f8kyq {
            width: 270px !important;
            height: auto !important; /* 사진 비율에 맞춰 세로로 늘어남 */
            max-width: 100% !important;
            position: relative !important;
            display: block !important;
        }
        .css-1f8kyq .aspect-\\[2\\/3\\] {
            aspect-ratio: auto !important;
            height: auto !important;
            display: block !important;
        }

        /* 크리지널 로고 제외, 캐릭터 프사만 원본 비율로 출력 */
        .css-1f8kyq .aspect-\\[2\\/3\\] img:not(.blur-md):not([alt="crack original"]) {
            position: relative !important;
            object-fit: contain !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
        }

        /* =========================================
           4. 🚨 [정보창 팝업 모달] 원본 비율 자동 맞춤 (여백/블러 제거) 🚨
           ========================================= */
        div[role="dialog"] .character-info-modal-content-body div[class*="w-\\[220px\\]"] {
            width: 220px !important;
            height: auto !important; /* 1:1 강제 해제, 원본 비율 존중 */
            position: relative !important;
            border-radius: 12px !important;
            overflow: hidden !important;
            display: block !important; /* flex 금지 (찌그러짐 방지) */
        }
        div[role="dialog"] .character-info-modal-content-body div[class*="w-\\[220px\\]"] .aspect-\\[2\\/3\\] {
            aspect-ratio: auto !important; /* 1:1 강제 해제 */
            width: 100% !important;
            height: auto !important;
            display: block !important;
        }
        div[role="dialog"] .character-info-modal-content-body div[class*="w-\\[220px\\]"] img.blur-md {
            display: none !important;
        }

        /* 🚨 크리지널 로고 제외, 캐릭터 프사만 원본 비율에 맞춰 높이 조절 🚨 */
        div[role="dialog"] .character-info-modal-content-body div[class*="w-\\[220px\\]"] img:not(.blur-md):not([alt="crack original"]) {
            position: relative !important;
            inset: auto !important;
            width: 100% !important;
            height: auto !important; /* 원본 비율대로 출력 */
            object-fit: contain !important; /* 원본 훼손 없이 꽉 채움 */
            border-radius: inherit;
            display: block !important;
        }

        /* =========================================
           5. 좋아요 하트 버튼 커스텀 (프사 우측 하단)
           ========================================= */
        .character-info-modal-content-body div[class*="w-\\[220px\\]"] > button[aria-label="좋아요"],
        .css-1f8kyq > button[aria-label="좋아요"] {
            position: absolute !important;
            bottom: 12px !important;
            right: 12px !important;
            z-index: 50 !important;
            background: rgba(255, 255, 255, 0.85) !important;
            border-radius: 50% !important;
            padding: 8px !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3) !important;
            width: 44px !important;
            height: 44px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            border: none !important;
        }
        html[data-theme="dark"] .character-info-modal-content-body div[class*="w-\\[220px\\]"] > button[aria-label="좋아요"],
        html[data-theme="dark"] .css-1f8kyq > button[aria-label="좋아요"] {
            background: rgba(30, 30, 30, 0.85) !important;
        }
        .character-info-modal-content-body div[class*="w-\\[220px\\]"] > button[aria-label="좋아요"] svg,
        .css-1f8kyq > button[aria-label="좋아요"] svg {
            width: 24px !important;
            height: 24px !important;
            fill: #FF4432 !important;
        }
    `;

    if (typeof GM_addStyle !== "undefined") {
        GM_addStyle(customCSS);
    } else {
        let styleNode = document.createElement("style");
        styleNode.appendChild(document.createTextNode(customCSS));
        (document.querySelector("head") || document.documentElement).appendChild(styleNode);
    }

    // 좋아요 버튼 위치 조작
    const observer = new MutationObserver(() => {
        const likeBtns = document.querySelectorAll('button[aria-label="좋아요"]');

        likeBtns.forEach(btn => {
            if (btn.dataset.moved) return;

            // 1. 모달창
            const modalBody = btn.closest('.character-info-modal-content-body');
            if (modalBody) {
                const modalProfile = modalBody.querySelector('div[class*="w-\\[220px\\]"]');
                if (modalProfile && btn.parentElement !== modalProfile) {
                    modalProfile.appendChild(btn);
                    btn.dataset.moved = 'true';
                }
                return;
            }

            // 2. 상세 페이지
            const detailProfile = document.querySelector('.css-1f8kyq');
            if (detailProfile && document.body.contains(detailProfile)) {
                const detailContainer = btn.closest('.css-bdwsp8');
                if (detailContainer && btn.parentElement !== detailProfile) {
                    detailProfile.appendChild(btn);
                    btn.dataset.moved = 'true';
                }
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
